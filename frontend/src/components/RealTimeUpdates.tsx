import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

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

  useEffect(() => {
    // Polling for real-time updates (can be replaced with WebSocket)
    const pollForUpdates = async () => {
      try {
        // Check for room status changes
        const rooms = await apiService.getRooms();
        // Process room updates...

        // Check for new notifications
        const notifications = await apiService.getNotifications();
        // Process notifications...

        setIsConnected(true);
      } catch (error) {
        console.error('Real-time update error:', error);
        setIsConnected(false);
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(pollForUpdates, 30000);
    
    // Initial poll
    pollForUpdates();

    return () => clearInterval(interval);
  }, [onRoomStatusChange, onBookingUpdate, onNotification]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
        isConnected 
          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
          : 'bg-red-500/20 text-red-300 border border-red-500/30'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          {isConnected ? 'Live Updates Active' : 'Connection Lost'}
        </div>
      </div>
    </div>
  );
};