import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  // Removed unused variables to fix TypeScript warnings

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
    
    this.socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
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
  onRoomStatusChanged(callback: (data: { buildingNumber: string; roomNumber: string; status: string }) => void) {
    this.socket?.on('roomStatusChanged', callback);
  }

  // Booking events
  onBookingUpdated(callback: (data: { booking: any }) => void) {
    this.socket?.on('bookingUpdated', callback);
  }

  // Notification events
  onNewNotification(callback: (data: { notification: any }) => void) {
    this.socket?.on('newNotification', callback);
  }

  // Join/leave building rooms
  joinBuilding(buildingNumber: string) {
    this.socket?.emit('joinBuilding', buildingNumber);
  }

  leaveBuilding(buildingNumber: string) {
    this.socket?.emit('leaveBuilding', buildingNumber);
  }

  // Remove listeners
  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();