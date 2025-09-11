import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';

interface RealTimeUpdatesProps {
  onRoomStatusChange?: (roomId: string, status: string) => void;
  onBookingUpdate?: (booking: any) => void;
  onNotification?: (notification: any) => void;
}

export const RealTimeUpdates = ({ 
  onRoomStatusChange, 
  onBookingUpdate, 
  onNotification 
}: RealTimeUpdatesProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    // Connect to Socket.io only once
    const socket = socketService.connect();
    if (!socket) return;
    
    console.log('🔌 RealTimeUpdates: Setting up socket connection');

    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      setLastUpdate(new Date());
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleRoomStatusChange = (data) => {
      if (onRoomStatusChange) {
        onRoomStatusChange(data.roomNumber, data.status);
      }
      setLastUpdate(new Date());
    };

    const handleBookingUpdate = (data) => {
      if (onBookingUpdate) {
        onBookingUpdate(data.booking);
      }
      setLastUpdate(new Date());
    };

    const handleNewNotification = (data) => {
      if (onNotification) {
        onNotification(data.notification);
      }
      setLastUpdate(new Date());
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socketService.onRoomStatusChanged(handleRoomStatusChange);
    socketService.onBookingUpdated(handleBookingUpdate);
    socketService.onNewNotification(handleNewNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socketService.off('roomStatusChanged', handleRoomStatusChange);
      socketService.off('bookingUpdated', handleBookingUpdate);
      socketService.off('newNotification', handleNewNotification);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm transition-all duration-500 ${
        isConnected 
          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
      }`}>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
          }`}></div>
          <span className="text-xs">{isConnected ? 'Live' : 'Connecting'}</span>
        </div>
      </div>
    </div>
  );
};