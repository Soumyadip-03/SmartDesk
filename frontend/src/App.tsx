import { Heart, Bell, Menu, User, Settings, LogOut, Calendar } from "lucide-react";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./contexts/ThemeContext";
import { useState, useEffect, useCallback } from "react";
import { BuildingCard } from "./components/BuildingCard";
import { AccountInterface } from "./components/AccountInterface";
import { BuildingDetail } from "./components/BuildingDetail";
import { SettingsInterface } from "./components/SettingsInterface";
import { NotificationPanel } from "./components/NotificationPanel";
import { WishlistInterface } from "./components/WishlistInterface";
import { BookingsInterface } from "./components/BookingsInterface";
import { AuthGuard } from "./components/AuthGuard";

import { AdminDashboard } from "./components/AdminDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Toast } from "./components/Toast";
import { RealTimeUpdates } from "./components/RealTimeUpdates";
import { apiService } from "./services/api";
import { ASSETS, AudioManager } from "./utils/assets";
import { ChatBotToggle } from "./components/ChatBotToggle";

interface WishlistRoom {
  rNo: string;
  bNo: number;
  rType: string;
  rStatus: string;
  capacity?: number;
  floor?: number;
}

export default function App() {
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccountInterface, setShowAccountInterface] = useState(false);
  const [showSettingsInterface, setShowSettingsInterface] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showWishlistInterface, setShowWishlistInterface] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [wishlistRooms, setWishlistRooms] = useState<WishlistRoom[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userName, setUserName] = useState("");
  
  // Helper function to get first name from full name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0] || fullName;
  };
  const [bookings, setBookings] = useState<any[]>([]);
  const [showBookingsInterface, setShowBookingsInterface] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  const handleCloseToast = useCallback(() => {
    setShowToast(false);
  }, []);

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (!user) return;
    if (isLoadingUserData) return;
    
    const abortController = new AbortController();
    setIsLoadingUserData(true);
    
    const loadUserData = async () => {
      try {
        // Load wishlist from database
        const wishlistData = await apiService.getWishlist();
        if (abortController.signal.aborted) return;
        
        const formattedWishlist = wishlistData.map((item: any) => ({
          rNo: item.rNo,
          bNo: item.bNo,
          rType: item.room?.rType || 'General',
          rStatus: item.room?.rStatus || 'Available',
          capacity: item.room?.capacity || 0
        }));
        setWishlistRooms(formattedWishlist);
        
        // Load bookings from database
        const bookingsData = await apiService.getBookings();
        if (abortController.signal.aborted) return;
        
        const formattedBookings = bookingsData.map((booking: any) => ({
          id: booking.bookingId?.toString() || booking.id?.toString() || Date.now().toString(),
          roomNumber: booking.rNo || booking.roomNumber,
          buildingNumber: (booking.bNo || booking.buildingNumber)?.toString(),
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status || 'confirmed',
          facultyName: user.name || 'Unknown',
          courseSubject: booking.subject || booking.courseSubject || booking.purpose || 'N/A',
          purpose: booking.subject || booking.purpose || '',
          numberOfStudents: booking.numberOfStudents?.toString() || '0',
          notes: booking.notes || ''
        }));
        setBookings(formattedBookings);
        
        // Load unread notification count
        const unreadCount = await apiService.getUnreadNotificationCount();
        if (abortController.signal.aborted) return;
        
        setUnreadNotificationCount(unreadCount.count || 0);
        
        // Request notification permission and preload sound
        if ('Notification' in window) {
          Notification.requestPermission();
        }
        AudioManager.preloadSounds([ASSETS.SOUNDS.NOTIFICATION]);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load user data:', error);
        }
      } finally {
        setIsLoadingUserData(false);
      }
    };
    
    loadUserData();
    
    return () => {
      abortController.abort();
    };
  }, [user?.id]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const [buildings, setBuildings] = useState<any[]>([
    { id: "1", name: "Building - 01", buildingNumber: "1", roomCount: 36 },
    { id: "2", name: "Building - 02", buildingNumber: "2", roomCount: 36 },
    { id: "3", name: "Building - 03", buildingNumber: "3", roomCount: 36 },
    { id: "4", name: "Building - 04", buildingNumber: "4", roomCount: 36 },
    { id: "5", name: "Building - 05", buildingNumber: "5", roomCount: 36 },
    { id: "6", name: "Building - 06", buildingNumber: "6", roomCount: 36 },
    { id: "7", name: "Building - 07", buildingNumber: "7", roomCount: 36 },
  ]);
  const [buildingsLoaded, setBuildingsLoaded] = useState(false);

  // Load buildings from API
  useEffect(() => {
    if (!user || buildingsLoaded) return;
    
    const loadBuildings = async () => {
      try {
        const buildingsData = await apiService.getBuildings();
        if (buildingsData && buildingsData.length > 0) {
          const formattedBuildings = buildingsData.map((building: any) => ({
            id: building.bNo.toString(),
            name: building.bName,
            buildingNumber: building.bNo.toString(),
            roomCount: building.rooms ? building.rooms.length : 36
          }));
          setBuildings(formattedBuildings);
        }
      } catch (error) {
        console.error('Failed to load buildings:', error);
      } finally {
        setBuildingsLoaded(true);
      }
    };

    loadBuildings();
  }, [user, buildingsLoaded]);

  const handleBuildingClick = (buildingNumber: string) => {
    setSelectedBuilding(buildingNumber);
  };

  const handleHome = () => {
    setIsMenuOpen(false);
    setShowAccountInterface(false);
    setShowSettingsInterface(false);
    setShowWishlistInterface(false);
    setShowBookingsInterface(false);
    setShowAdminDashboard(false);
    setSelectedBuilding(null);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setUserName('');
    setWishlistRooms([]);
    setBookings([]);
    // Force page reload to reset AuthGuard state
    window.location.reload();
  };

  const handleAddToWishlist = async (room: any) => {
    setIsLoading(true);
    try {
      const roomNumber = room.rNo || room.roomNumber;
      const buildingNumber = room.bNo || room.buildingNumber;
      
      if (!roomNumber || !buildingNumber) {
        throw new Error('Room number and building number are required');
      }
      
      await apiService.addToWishlist(roomNumber, buildingNumber.toString());
      
      const wishlistRoom = {
        rNo: roomNumber,
        bNo: typeof buildingNumber === 'string' ? parseInt(buildingNumber) : buildingNumber,
        rType: room.rType || 'General',
        rStatus: room.rStatus || 'Available',
        capacity: room.capacity || 0
      };
      
      setWishlistRooms(prev => {
        const exists = prev.find(r => r.rNo === roomNumber && r.bNo === wishlistRoom.bNo);
        if (!exists) {
          setToastMessage(`Room ${roomNumber} added to wishlist!`);
          setShowToast(true);
          return [...prev, wishlistRoom];
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (roomNumber: string, buildingNumber: number) => {
    setIsLoading(true);
    try {
      await apiService.removeFromWishlist(roomNumber, buildingNumber.toString());
      setWishlistRooms(prev => prev.filter(room => !(room.rNo === roomNumber && room.bNo === buildingNumber)));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async (bookingData: any) => {
    setIsLoading(true);
    try {
      let newBooking;
      
      if (bookingData.bookingType === 'swap') {
        // Handle room swap
        newBooking = await apiService.swapToRoom({
          roomNumber: bookingData.roomNumber,
          buildingNumber: bookingData.buildingNumber,
          courseSubject: bookingData.courseSubject || '',
          numberOfStudents: bookingData.numberOfStudents || '',
          purpose: bookingData.purpose || '',
          notes: bookingData.notes || '',
          currentRoom: bookingData.currentRoom
        });
        
        setToastMessage(`Room swapped successfully to ${bookingData.roomNumber}!`);
        setShowToast(true);
      } else {
        // Handle regular booking
        newBooking = await apiService.createBooking({
          roomNumber: bookingData.roomNumber,
          buildingNumber: bookingData.buildingNumber,
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          bookingType: bookingData.bookingType || 'later',
          purpose: bookingData.purpose || '',
          notes: bookingData.notes || '',
          courseSubject: bookingData.courseSubject || '',
          numberOfStudents: bookingData.numberOfStudents || ''
        });
        
        setToastMessage(`Room ${bookingData.roomNumber} booked successfully!`);
        setShowToast(true);
      }
      
      const formattedBooking = {
        id: newBooking.bookingId?.toString() || Date.now().toString(),
        roomNumber: bookingData.roomNumber,
        buildingNumber: bookingData.buildingNumber,
        date: bookingData.date || new Date().toISOString().split('T')[0],
        startTime: bookingData.startTime || '09:00',
        endTime: bookingData.endTime || '10:00',
        status: 'confirmed',
        facultyName: bookingData.facultyName || user?.name || 'Unknown',
        courseSubject: bookingData.courseSubject || bookingData.purpose || 'N/A',
        numberOfStudents: bookingData.numberOfStudents || '0',
        notes: bookingData.notes || '',
        purpose: bookingData.purpose || ''
      };
      
      setBookings(prev => {
        const exists = prev.find(b => b.id === formattedBooking.id);
        return exists ? prev : [...prev, formattedBooking];
      });
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    try {
      await apiService.cancelBooking(bookingId);
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setIsLoading(true);
    try {
      await apiService.deleteBooking(bookingId);
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Failed to delete booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserNameUpdate = (newName: string) => {
    setUserName(newName);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userId = user.id || 'guest';
    sessionStorage.setItem(`${userId}_fullName`, newName);
  };

  const handleAuthLogin = (userData: any) => {
    setUser(userData);
    setUserName(userData.name || '');
  };

  return (
    <ErrorBoundary>
      <AuthGuard onLogin={handleAuthLogin}>
        <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHI+PIKdlbCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative z-10 p-6">
        {/* Clean Header Section */}
        <div className="relative mb-8">
          {/* Header Content */}
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              {/* 3D Generated Logo */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:scale-110 flex items-center justify-center relative overflow-hidden group">
                  {/* 3D depth effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300/20 via-orange-400/20 to-red-400/20 blur-sm"></div>
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                  
                  {/* Inner glow */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 via-orange-100/30 to-transparent"></div>
                  
                  {/* Logo content - SD Text */}
                  <div className="relative z-10 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700/80 tracking-tight drop-shadow-sm">
                      SD
                    </span>
                  </div>
                  
                  {/* Rotating shine */}
                  <div className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-white/70 to-orange-200/50 rounded-full blur-sm group-hover:animate-pulse transition-all duration-300"></div>
                </div>
              </div>
              <h1 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>SmartDesk</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Wishlist */}
              <button 
                className={`relative p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-800/20'
                }`}
                onClick={() => setShowWishlistInterface(true)}
              >
                <Heart className={`w-5 h-5 transition-colors ${wishlistRooms.length > 0 ? "text-red-400" : (theme === 'dark' ? "text-gray-400" : "text-gray-700")}`} />
                {wishlistRooms.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{wishlistRooms.length}</span>
                  </div>
                )}
              </button>
              
              {/* Bookings */}
              <button 
                className={`relative p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-800/20'
                }`}
                onClick={() => setShowBookingsInterface(true)}
                title="My Bookings"
              >
                <Calendar className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`} />
                {bookings.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{bookings.length}</span>
                  </div>
                )}
              </button>
              
              {/* Notifications */}
              <button 
                className={`relative p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-800/20'
                }`}
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              >
                <Bell className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`} />
                {unreadNotificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{unreadNotificationCount}</span>
                  </div>
                )}
              </button>
              
              {/* Menu */}
              <button 
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-800/20'
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`} />
              </button>
            </div>
          </header>
          
          {/* 3D Separator Line */}
          <div className="relative mt-6">
            {/* Main 3D line */}
            <div className={`h-1 w-full rounded-full shadow-lg ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-transparent via-gray-600 to-transparent shadow-white/10' 
                : 'bg-gradient-to-r from-transparent via-gray-400 to-transparent shadow-gray-500/30'
            }`}></div>
            
            {/* Top highlight */}
            <div className={`absolute top-0 left-0 h-px w-full rounded-full ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-transparent via-white/40 to-transparent' 
                : 'bg-gradient-to-r from-transparent via-white/80 to-transparent'
            }`}></div>
          </div>
        </div>

        {/* Date */}
        <div className="flex justify-end mb-8">
          <div className={`backdrop-blur-sm rounded-lg px-4 py-2 border ${
            theme === 'dark' 
              ? 'bg-white/10 border-white/10 text-white/80' 
              : 'bg-gray-800/90 border-gray-700 text-white shadow-lg'
          }`}>
            <span className="text-sm text-white">{formatDate(currentDate)}</span>
          </div>
        </div>

        {/* Buildings Section */}
        <div className="mb-8">
          <div className={`backdrop-blur-sm px-4 py-2 border inline-block ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-white/20 to-white/10 border-white/10 text-white'
              : 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-gray-600 text-white shadow-lg'
          }`} style={{borderRadius: '3rem'}}>
            <span className="text-sm font-medium text-white">Buildings</span>
          </div>
        </div>

        {/* Buildings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!buildingsLoaded ? (
            <div className="col-span-full">
              <LoadingSpinner size="lg" text="Loading buildings..." />
            </div>
          ) : buildings.length === 0 ? (
            <div className="col-span-full flex justify-center items-center h-32">
              <div className={`${
                theme === 'dark' ? 'text-white/60' : 'text-gray-600'
              }`}>No buildings found</div>
            </div>
          ) : (
            buildings.map((building) => (
              <BuildingCard
                key={building.id}
                id={building.id}
                name={building.name}
                buildingNumber={building.buildingNumber}
                roomCount={building.roomCount}
                onClick={() => handleBuildingClick(building.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Navigation Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className={`absolute top-20 right-6 w-72 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-white/20 to-white/10 border-white/20'
                : 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-600'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border ${
                theme === 'dark' ? 'border-white/20' : 'border-gray-400'
              }`}>
                <User className="w-8 h-8 text-white/80" />
              </div>
              <h3 className="text-white font-medium">Welcome Back</h3>
              <p className="text-white/80 text-sm">{getFirstName(userName) || "Guest User"}</p>
            </div>

            <nav className="space-y-3">
              <button 
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowAccountInterface(true);
                }}
              >
                <div className="p-2 bg-white/20 rounded-xl">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium">ACCOUNT</span>
              </button>
              
              <button 
                className="w-full flex items-center gap-4 p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/10"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowSettingsInterface(true);
                }}
              >
                <div className="p-2 bg-white/20 rounded-xl">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="font-medium">SETTINGS</span>
              </button>
              
              {/* Only show admin button for admin role */}
              {user?.role === 'admin' && (
                <button 
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white rounded-2xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 border border-purple-500/30"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowAdminDashboard(true);
                  }}
                >
                  <div className="p-2 bg-purple-500/30 rounded-xl">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="font-medium">ADMIN</span>
                </button>
              )}
              
              <div className="border-t border-white/20 pt-3 mt-3">
                <button 
                  className="w-full flex items-center gap-4 p-4 bg-red-500/20 text-white rounded-2xl hover:bg-red-500/30 transition-all duration-300 border border-red-500/30"
                  onClick={handleLogout}
                >
                  <div className="p-2 bg-red-500/30 rounded-xl">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="font-medium">LOGOUT</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Account Interface */}
      {showAccountInterface && (
        <AccountInterface 
          onClose={() => setShowAccountInterface(false)}
          onHome={handleHome}
          onSettings={() => {
            setShowAccountInterface(false);
            setShowSettingsInterface(true);
          }}
          onWishlist={() => {
            setShowAccountInterface(false);
            setShowWishlistInterface(true);
          }}
          onNotifications={() => {
            setShowAccountInterface(false);
            setShowNotificationPanel(true);
          }}
          onAdmin={user?.role === 'admin' ? () => {
            setShowAccountInterface(false);
            setShowAdminDashboard(true);
          } : undefined}
          onLogout={handleLogout}
          onUserNameUpdate={handleUserNameUpdate}
          bookings={bookings}
          wishlistCount={wishlistRooms.length}
          onShowBookings={() => {
            setShowAccountInterface(false);
            setShowBookingsInterface(true);
          }}
        />
      )}

      {/* Settings Interface */}
      {showSettingsInterface && (
        <SettingsInterface 
          onClose={() => setShowSettingsInterface(false)}
          onHome={handleHome}
          onAccount={() => {
            setShowSettingsInterface(false);
            setShowAccountInterface(true);
          }}
          onAdmin={user?.role === 'admin' ? () => {
            setShowSettingsInterface(false);
            setShowAdminDashboard(true);
          } : undefined}
          onLogout={handleLogout}
        />
      )}

      {/* Notification Panel */}
      {showNotificationPanel && (
        <NotificationPanel 
          onClose={() => {
            setShowNotificationPanel(false);
            // Refresh unread count when closing
            if (user) {
              apiService.getUnreadNotificationCount().then(data => {
                setUnreadNotificationCount(data.count || 0);
              }).catch(console.error);
            }
          }} 
        />
      )}

      {/* Wishlist Interface */}
      {showWishlistInterface && (
        <WishlistInterface 
          wishlistRooms={wishlistRooms}
          onClose={() => setShowWishlistInterface(false)}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onHome={handleHome}
          onBooking={handleBooking}
        />
      )}

      {/* Bookings Interface */}
      {showBookingsInterface && (
        <BookingsInterface 
          bookings={bookings}
          onHome={handleHome}
          onCancelBooking={handleCancelBooking}
          onDeleteBooking={handleDeleteBooking}
        />
      )}

      {/* Admin Dashboard */}
      {showAdminDashboard && (
        <AdminDashboard 
          onClose={() => setShowAdminDashboard(false)}
          onHome={handleHome}
          onAccount={() => {
            setShowAdminDashboard(false);
            setShowAccountInterface(true);
          }}
          onSettings={() => {
            setShowAdminDashboard(false);
            setShowSettingsInterface(true);
          }}
          onLogout={handleLogout}
        />
      )}

      {/* Building Detail */}
      {selectedBuilding && (
        <BuildingDetail 
          buildingNumber={selectedBuilding}
          onBack={() => setSelectedBuilding(null)}
          onAddToWishlist={(room: WishlistRoom) => handleAddToWishlist(room)}
          onBooking={handleBooking}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <LoadingSpinner size="lg" text="Processing..." />
          </div>
        </div>
      )}

      {/* Real-time Updates */}
      <RealTimeUpdates 
        onRoomStatusChange={(roomId, status) => {
          console.log(`🏠 Room ${roomId} status: ${status}`);
        }}
        onBookingUpdate={(booking) => {
          console.log('📅 Booking updated:', booking);
          setBookings(prev => {
            const formattedBooking = {
              id: booking.bookingId?.toString() || Date.now().toString(),
              roomNumber: booking.rNo,
              buildingNumber: booking.bNo?.toString(),
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime,
              status: booking.status || 'confirmed',
              facultyName: user?.name || 'Unknown',
              courseSubject: booking.subject || 'N/A',
              numberOfStudents: booking.numberOfStudents?.toString() || '0',
              notes: booking.notes || ''
            };
            
            const exists = prev.find(b => b.id === formattedBooking.id);
            if (exists) {
              return prev.map(b => b.id === formattedBooking.id ? formattedBooking : b);
            }
            return [...prev, formattedBooking];
          });
        }}
        onNotification={(notification) => {
          console.log('🔔 New notification:', notification);
          setUnreadNotificationCount(prev => prev + 1);
          setToastMessage('New notification received!');
          setShowToast(true);
          
          // Check settings before playing sound/showing notification
          const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
          const notificationsEnabled = localStorage.getItem('notifications') === 'true';
          
          // Play notification sound if enabled
          if (soundEnabled) {
            AudioManager.playSound(ASSETS.SOUNDS.NOTIFICATION, 1.0);
          }
          
          // Show browser notification if enabled
          if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('SmartDesk Notification', {
              body: notification.message || 'You have a new notification',
              icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3CradialGradient id='bg' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23fbbf24'/%3E%3Cstop offset='50%25' stop-color='%23f97316'/%3E%3Cstop offset='100%25' stop-color='%23ef4444'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='24' cy='24' r='24' fill='url(%23bg)'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' font-weight='700' fill='%23374151' fill-opacity='0.8'%3ESD%3C/text%3E%3C/svg%3E",
              badge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3CradialGradient id='bg' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23fbbf24'/%3E%3Cstop offset='50%25' stop-color='%23f97316'/%3E%3Cstop offset='100%25' stop-color='%23ef4444'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='24' cy='24' r='24' fill='url(%23bg)'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' font-weight='700' fill='%23374151' fill-opacity='0.8'%3ESD%3C/text%3E%3C/svg%3E",
              tag: 'smartdesk-notification',
              silent: false
            });
          }
        }}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message={toastMessage}
          onClose={handleCloseToast}
        />
      )}

      {/* AI Chatbot */}
      <ChatBotToggle />
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}