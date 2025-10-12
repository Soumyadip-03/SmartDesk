import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found, cannot connect to Socket.io');
      return null;
    }
    
    if (this.socket) {
      console.log('✅ Socket already exists');
      return this.socket;
    }

    console.log('🔌 Connecting to Socket.io...');
    
    const socketUrl = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3001';
    console.log('🔌 Socket URL:', socketUrl);
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 2000,
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', String(reason));
    });

    this.socket.on('connect_error', (error) => {
      const sanitizedMessage = error?.message ? String(error.message).replace(/[\r\n]/g, '') : 'Unknown error';
      console.error('❌ Socket connection error:', sanitizedMessage);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Room status events
  onRoomStatusChanged(callback: (data: { buildingNumber: string; roomNumber: string; status: string }) => void): void {
    this.socket?.on('roomStatusChanged', callback);
  }

  // Booking events
  onBookingUpdated(callback: (data: { booking: { id: string; roomNumber: string; buildingNumber: string; status: string } }) => void): void {
    this.socket?.on('bookingUpdated', callback);
  }

  // Notification events
  onNewNotification(callback: (data: { notification: { id: string; message: string; type?: string; timestamp?: string } }) => void): void {
    this.socket?.on('newNotification', callback);
  }

  // Join/leave building rooms
  joinBuilding(buildingNumber: string): void {
    this.socket?.emit('joinBuilding', buildingNumber);
  }

  leaveBuilding(buildingNumber: string): void {
    this.socket?.emit('leaveBuilding', buildingNumber);
  }

  // Remove listeners
  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();