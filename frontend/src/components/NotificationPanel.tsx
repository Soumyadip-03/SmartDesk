import { X, Bell, Clock, CheckCircle, AlertCircle, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "../services/api";

interface NotificationPanelProps {
  onClose: () => void;
}

interface Notification {
  id: string;
  type: "booking" | "reminder" | "update" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  urgent?: boolean;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Auto-refresh notifications every 3 seconds
    const interval = setInterval(loadNotifications, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      const formattedNotifications = data.map((notif: any) => ({
        id: notif.notificationId.toString(),
        type: notif.type || 'system',
        title: notif.title || 'Notification',
        message: notif.message || '',
        time: new Date(notif.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        read: notif.isRead,
        urgent: notif.urgent || false
      }));
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      if (loading) setLoading(false);
    }
  };



  const markAsRead = async (id: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Update UI immediately
    const updated = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    
    // Update database in background
    try {
      await apiService.markNotificationAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update database first
      await apiService.markAllNotificationsAsRead();
      // Update UI after successful database update
      const updated = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updated);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Only update local state, don't delete from database
      const updated = notifications.filter(notif => notif.id !== id);
      setNotifications(updated);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Clear from database
      await apiService.clearAllNotifications();
      // Clear local state
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  const getNotificationIcon = (type: string, urgent?: boolean) => {
    switch (type) {
      case "booking":
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case "reminder":
        return <Clock className={`w-5 h-5 ${urgent ? "text-red-400" : "text-yellow-400"}`} />;
      case "update":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "system":
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50" onClick={onClose}>
      <div 
        className="absolute top-20 right-6 w-96 h-[70vh] bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{unreadCount}</span>
                  </div>
                )}
              </div>
              <h2 className="text-white font-medium text-lg">Notifications</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-3"></div>
              <p className="text-white/60">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">No notifications yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    !notification.read 
                      ? "bg-white/15 border-white/20 hover:bg-white/20" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  } ${notification.urgent ? "ring-2 ring-red-400/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-white/10 rounded-xl">
                      {getNotificationIcon(notification.type, notification.urgent)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={(e) => markAsRead(notification.id, e)}
                        >
                          <h3 className={`font-medium ${!notification.read ? "text-white" : "text-white/80"}`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1 ${!notification.read ? "text-white/80" : "text-white/60"}`}>
                            {notification.message}
                          </p>
                          <p className="text-white/50 text-xs mt-2">{notification.time}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3 text-white/60" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-white/10 space-y-3">
          <button 
            onClick={loadNotifications}
            className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Refresh Notifications
          </button>
          {notifications.length > 0 && (
            <button 
              onClick={clearAllNotifications}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
            >
              Clear All Notifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
}