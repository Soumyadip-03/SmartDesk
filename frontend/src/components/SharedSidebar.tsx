import { Home, User, Settings, LogOut, Calendar, Shield } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface SharedSidebarProps {
  title: string;
  activeSection?: string;
  onClose: () => void;
  onHome?: () => void;
  onAccount?: () => void;
  onSettings?: () => void;
  onWishlist?: () => void;
  onNotifications?: () => void;
  onBookings?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
  bookingsCount?: number;
  wishlistCount?: number;
  children?: React.ReactNode;
}

export function SharedSidebar({ 
  title, 
  activeSection, 
  onClose, 
  onHome, 
  onAccount, 
  onSettings, 
  onWishlist,
  onNotifications,
  onBookings,
  onAdmin,
  onLogout,
  bookingsCount = 0,
  wishlistCount = 0,
  children 
}: SharedSidebarProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`w-80 backdrop-blur-md border-r ${
      theme === 'dark'
        ? 'bg-white/10 border-white/10'
        : 'bg-gray-800/90 border-gray-600'
    }`}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">{title}</h1>
        </div>
        
        <nav className="space-y-2">
          {onHome && (
            <button 
              onClick={onHome}
              className="w-full flex items-center gap-3 p-4 text-white hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">HOME</span>
            </button>
          )}
          
          {onBookings && (
            <button 
              onClick={onBookings}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all relative ${
                activeSection === "bookings" 
                  ? "bg-white/20 text-white border border-white/20" 
                  : "text-white hover:text-white hover:bg-white/10"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">BOOKINGS</span>
              {bookingsCount > 0 && (
                <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">{bookingsCount}</span>
                </div>
              )}
            </button>
          )}
          
          {onAccount && (
            <button 
              onClick={onAccount}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                activeSection === "account" 
                  ? "bg-white/20 text-white border border-white/20" 
                  : "text-white hover:text-white hover:bg-white/10"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">ACCOUNT</span>
            </button>
          )}
          
          {onSettings && (
            <button 
              onClick={onSettings}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                activeSection === "settings" 
                  ? "bg-white/20 text-white border border-white/20" 
                  : "text-white hover:text-white hover:bg-white/10"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">SETTINGS</span>
            </button>
          )}
          
          {onAdmin && (
            <button 
              onClick={onAdmin}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                activeSection === "admin" 
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                  : "text-white hover:text-white hover:bg-white/10"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">ADMIN</span>
            </button>
          )}
          
          {children}
          
          <div className="border-t border-white/20 pt-3 mt-3">
            <button 
              onClick={onLogout || onClose}
              className="w-full flex items-center gap-3 p-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all border border-red-500/30"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">LOGOUT</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}