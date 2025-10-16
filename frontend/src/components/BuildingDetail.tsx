import { ArrowLeft, Filter } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { CompactRoomBookingModal } from "./CompactRoomBookingModal";
import { apiService } from "../services/api";
import { socketService } from "../services/socket";
import { useTheme } from "../contexts/ThemeContext";

// Global cache for room data - persists across rapid building switches
const roomCache = new Map<string, Room[]>();
// Make cache globally accessible for admin updates
(window as any).roomCache = roomCache;

// Clear stale cache on component load
const clearStaleCache = () => {
  const now = Date.now();
  const cacheTimeout = 30000; // 30 seconds
  
  // Clear old cache entries
  for (const [key, value] of roomCache.entries()) {
    if (value && (value as any).timestamp && now - (value as any).timestamp > cacheTimeout) {
      roomCache.delete(key);
    }
  }
  
  // Clear browser cache for room data
  if (typeof window !== 'undefined') {
    delete (window as any).bookingCache;
  }
};

interface WishlistRoom {
  rNo: string;
  bNo: number;
  rType: string;
  rStatus: string;
  capacity?: number;
  floor?: number;
}

interface BuildingDetailProps {
  buildingNumber: string;
  onBack: () => void;
  onAddToWishlist?: (room: WishlistRoom) => void;
  onBooking?: (bookingData: any) => void;
}

interface Room {
  rNo: string;
  bNo: number;
  rType: string;
  rStatus: string;
  capacity?: number;
  floor?: number;
}

export function BuildingDetail({ buildingNumber, onBack, onAddToWishlist, onBooking }: BuildingDetailProps) {
  const { theme } = useTheme();
  const [roomTypeFilter, setRoomTypeFilter] = useState("all type");
  const [roomStatusFilter, setRoomStatusFilter] = useState("all status");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const roomTypes = [
    "all type",
    "Undefined",
    "Lecture Room",
    "Computer Lab",
    "Seminar Hall",
    "Laboratory",
    "Auditorium",
    "Conference Room",
    "Faculty Room"
  ];

  const roomStatuses = [
    "all status",
    "Available",
    "Booked", 
    "Maintenance"
  ];

  const generateStaticRooms = useMemo(() => {
    const rooms: Room[] = [];
    const floors = [0, 1, 2, 3, 4, 5];
    const roomsPerFloor = 6;

    floors.forEach(floor => {
      for (let roomIndex = 1; roomIndex <= roomsPerFloor; roomIndex++) {
        const roomPrefix = floor === 0 ? "00" : `${floor}0`;
        const roomNumber = `${roomPrefix}${roomIndex}`;
        
        rooms.push({
          rNo: roomNumber.padStart(3, '0'),
          bNo: parseInt(buildingNumber),
          rType: "Undefined",
          rStatus: "Available",
          capacity: 0,
          floor: floor
        });
      }
    });
    return rooms;
  }, [buildingNumber]);

  // Optimized room status checker with caching
  const checkRoomCurrentStatus = async (rooms: Room[]) => {
    const cacheKey = `bookings-${buildingNumber}-${new Date().toISOString().split('T')[0]}`;
    
    try {
      let allBookings = (window as any).bookingCache?.[cacheKey];
      
      if (!allBookings) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        allBookings = await apiService.getBuildingBookings(buildingNumber, today);
        
        // Cache bookings for 30 seconds
        if (!(window as any).bookingCache) (window as any).bookingCache = {};
        (window as any).bookingCache[cacheKey] = allBookings;
        setTimeout(() => {
          delete (window as any).bookingCache[cacheKey];
        }, 30000);
      }
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      return rooms.map(room => {
        const activeBooking = allBookings.find((booking: any) => {
          if (booking.rNo !== room.rNo || booking.bNo !== room.bNo || booking.status === 'cancelled') return false;
          
          const bookingDate = new Date(booking.date).toISOString().split('T')[0];
          if (bookingDate !== today) return false;
          
          let bookingStart, bookingEnd;
          if (booking.startTime.includes('T')) {
            bookingStart = new Date(booking.startTime);
            bookingEnd = new Date(booking.endTime);
          } else {
            bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
            bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);
          }
          
          return now >= bookingStart && now <= bookingEnd;
        });
        
        return activeBooking ? { ...room, rStatus: 'Booked' } : room;
      });
    } catch (error) {
      return rooms;
    }
  };

  useEffect(() => {
    // Clear stale cache first
    clearStaleCache();
    
    const cacheKey = `building-${buildingNumber}`;
    
    // Always show static rooms immediately - no loading state
    setAllRooms(generateStaticRooms);
    setLoading(false);
    
    // Check cache for instant update
    if (roomCache.has(cacheKey)) {
      const cachedRooms = roomCache.get(cacheKey)!;
      setAllRooms(cachedRooms);
    }
    
    // Fetch live data in background without blocking UI
    const fetchLiveData = async () => {
      try {
        // Fast parallel requests
        const [backendRooms, buildingBookings] = await Promise.all([
          apiService.getBuildingRooms(buildingNumber).catch(() => []),
          apiService.getBuildingBookings(buildingNumber, new Date().toISOString().split('T')[0]).catch(() => [])
        ]);
        
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const updatedRooms = generateStaticRooms.map(frontendRoom => {
          // Merge backend data
          const backendRoom = backendRooms.find((br: any) => 
            br.rNo === frontendRoom.rNo && br.bNo === frontendRoom.bNo
          );
          
          // Check active booking
          const activeBooking = buildingBookings.find((booking: any) => {
            if (booking.rNo !== frontendRoom.rNo || booking.status === 'cancelled') return false;
            
            const bookingDate = new Date(booking.date).toISOString().split('T')[0];
            if (bookingDate !== today) return false;
            
            let bookingStart, bookingEnd;
            if (booking.startTime.includes('T')) {
              bookingStart = new Date(booking.startTime);
              bookingEnd = new Date(booking.endTime);
            } else {
              bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
              bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);
            }
            
            return now >= bookingStart && now <= bookingEnd;
          });
          
          return {
            ...frontendRoom,
            rType: backendRoom?.rType || "Undefined",
            rStatus: activeBooking ? 'Booked' : (backendRoom?.rStatus || "Available"),
            capacity: backendRoom?.capacity || 0
          };
        });
        
        // Update UI and cache
        setAllRooms(updatedRooms);
        roomCache.set(cacheKey, updatedRooms);
        setLastRefresh(new Date());
      } catch (error) {
        console.log('Background update failed, using static rooms');
      }
    };

    // Debounced background update
    const timeoutId = setTimeout(fetchLiveData, 200);
    return () => clearTimeout(timeoutId);
  }, [buildingNumber, generateStaticRooms]);



  // Listen for real-time room status changes via Socket.io
  useEffect(() => {
    // Join building room for real-time updates
    socketService.joinBuilding(buildingNumber);

    const handleRoomStatusChange = (data: { buildingNumber: string; roomNumber: string; status: string }) => {
      if (data.buildingNumber === buildingNumber) {
        setAllRooms(prevRooms => {
          const updatedRooms = prevRooms.map(room => 
            room.rNo === data.roomNumber && room.bNo.toString() === data.buildingNumber
              ? { ...room, rStatus: data.status }
              : room
          );
          
          const cacheKey = `building-${buildingNumber}`;
          roomCache.set(cacheKey, updatedRooms);
          return updatedRooms;
        });
        setLastRefresh(new Date());
      }
    };

    socketService.onRoomStatusChanged(handleRoomStatusChange);

    return () => {
      socketService.leaveBuilding(buildingNumber);
      socketService.off('roomStatusChanged', handleRoomStatusChange);
    };
  }, [buildingNumber]);

  // Lightweight timer for status updates
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const buildingBookings = await apiService.getBuildingBookings(buildingNumber, new Date().toISOString().split('T')[0]);
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        setAllRooms(prevRooms => {
          const updatedRooms = prevRooms.map(room => {
            const activeBooking = buildingBookings.find((booking: any) => {
              if (booking.rNo !== room.rNo || booking.status === 'cancelled') return false;
              const bookingDate = new Date(booking.date).toISOString().split('T')[0];
              if (bookingDate !== today) return false;
              
              let bookingStart, bookingEnd;
              if (booking.startTime.includes('T')) {
                bookingStart = new Date(booking.startTime);
                bookingEnd = new Date(booking.endTime);
              } else {
                bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
                bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);
              }
              
              return now >= bookingStart && now <= bookingEnd;
            });
            
            return {
              ...room,
              rStatus: activeBooking ? 'Booked' : (room.rStatus === 'Maintenance' ? 'Maintenance' : 'Available')
            };
          });
          
          const cacheKey = `building-${buildingNumber}`;
          roomCache.set(cacheKey, updatedRooms);
          return updatedRooms;
        });
        
        setLastRefresh(new Date());
      } catch (error) {
        // Silent fail for background updates
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(timer);
  }, [buildingNumber]);

  const filteredRooms = allRooms.filter(room => {
    const typeMatch = roomTypeFilter === "all type" || room.rType === roomTypeFilter;
    const statusMatch = roomStatusFilter === "all status" || room.rStatus === roomStatusFilter;
    return typeMatch && statusMatch;
  });

  const getStatusColor = (rStatus: string) => {
    if (theme === 'light') {
      switch (rStatus) {
        case "Available":
          return "bg-green-500 border-green-600 text-white shadow-md";
        case "Booked":
          return "bg-red-500 border-red-600 text-white shadow-md";
        case "Maintenance":
          return "bg-gray-600 border-gray-700 text-white shadow-md";
        default:
          return "bg-blue-500 border-blue-600 text-white shadow-md";
      }
    }
    switch (rStatus) {
      case "Available":
        return "bg-green-500/20 border-green-500/40 text-green-300";
      case "Booked":
        return "bg-red-500/20 border-red-500/40 text-red-300";
      case "Maintenance":
        return "bg-gray-500/20 border-gray-500/40 text-gray-300";
      default:
        return "bg-white/20 border-white/20 text-white";
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleBooking = async (bookingData: any) => {
    if (onBooking) {
      // Ensure room and building numbers are properly set
      const completeBookingData = {
        ...bookingData,
        roomNumber: selectedRoom?.rNo,
        buildingNumber: selectedRoom?.bNo.toString()
      };
      await onBooking(completeBookingData);
      
      // Refresh room statuses after booking/swap
      const updatedRooms = await checkRoomCurrentStatus(allRooms);
      setAllRooms(updatedRooms);
      const cacheKey = `building-${buildingNumber}`;
      roomCache.set(cacheKey, updatedRooms);
    }
    setShowBookingModal(false);
  };

  const handleScheduling = async (bookingData: any) => {
    await handleBooking(bookingData);
  };

  const handleWishlist = async (room: Room) => {
    if (onAddToWishlist) {
      // Pass the room with correct structure
      const wishlistRoom: WishlistRoom = {
        rNo: room.rNo,
        bNo: room.bNo,
        rType: room.rType,
        rStatus: room.rStatus,
        capacity: room.capacity,
        floor: room.floor
      };
      await onAddToWishlist(wishlistRoom);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHI+PIKdlbCJ3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-30"></div>
      
      {/* Header */}
      <div className={`backdrop-blur-md border-b ${
        theme === 'dark'
          ? 'bg-gray-900/80 border-white/10'
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className={`w-6 h-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`} />
            </button>
            
            <div className="flex-1 flex justify-center">
              <div className={`backdrop-blur-sm rounded-full px-6 py-2 border ${
                theme === 'dark'
                  ? 'bg-white/20 border-white/20'
                  : 'bg-gray-800/90 border-gray-600 shadow-lg'
              }`}>
                <span className="text-white font-medium">Book Your Room - B{buildingNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-900'
              }`} />
              <span className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-900'
              }`}>Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-white/80' : 'text-gray-900'
              }`}>Room Type:</label>
              <select 
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className={`backdrop-blur-sm border rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-white/20 border-white/20 text-white focus:ring-white/30'
                    : 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500'
                }`}
              >
                {roomTypes.map(type => (
                  <option key={type} value={type} className="bg-black/80 backdrop-blur-md text-white border-none">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-white/80' : 'text-gray-900'
              }`}>Room Status:</label>
              <select 
                value={roomStatusFilter}
                onChange={(e) => setRoomStatusFilter(e.target.value)}
                className={`backdrop-blur-sm border rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-white/20 border-white/20 text-white focus:ring-white/30'
                    : 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500'
                }`}
              >
                {roomStatuses.map(status => (
                  <option key={status} value={status} className="bg-black/80 backdrop-blur-md text-white border-none">
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 p-6">

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className={`backdrop-blur-sm rounded-lg px-4 py-2 border ${
              theme === 'dark'
                ? 'bg-white/20 border-white/20'
                : 'bg-gray-800/90 border-gray-600 shadow-lg'
            }`}>
              <span className="text-white font-medium">Building {buildingNumber}</span>
            </div>
            <div className="h-px bg-white/20 flex-1"></div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-800'
              }`}>
                {loading ? 'Loading...' : `${filteredRooms.length} rooms`}
              </span>
              <span className={`text-xs ${
                theme === 'dark' ? 'text-white/40' : 'text-gray-700'
              }`}>
                Updated: {lastRefresh.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                onClick={async () => {
                  const cacheKey = `building-${buildingNumber}`;
                  roomCache.delete(cacheKey);
                  
                  // Clear all related caches
                  clearStaleCache();
                  delete (window as any).bookingCache;
                  
                  try {
                    const [backendRooms, buildingBookings] = await Promise.all([
                      apiService.getBuildingRooms(buildingNumber),
                      apiService.getBuildingBookings(buildingNumber, new Date().toISOString().split('T')[0])
                    ]);
                    
                    const now = new Date();
                    const today = now.toISOString().split('T')[0];
                    
                    const updatedRooms = generateStaticRooms.map(frontendRoom => {
                      const backendRoom = backendRooms.find((br: any) => 
                        br.rNo === frontendRoom.rNo && br.bNo === frontendRoom.bNo
                      );
                      
                      const activeBooking = buildingBookings.find((booking: any) => {
                        if (booking.rNo !== frontendRoom.rNo || booking.status === 'cancelled') return false;
                        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
                        if (bookingDate !== today) return false;
                        
                        let bookingStart, bookingEnd;
                        if (booking.startTime.includes('T')) {
                          bookingStart = new Date(booking.startTime);
                          bookingEnd = new Date(booking.endTime);
                        } else {
                          bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
                          bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);
                        }
                        
                        return now >= bookingStart && now <= bookingEnd;
                      });
                      
                      return {
                        ...frontendRoom,
                        rType: backendRoom?.rType || "Undefined",
                        rStatus: activeBooking ? 'Booked' : (backendRoom?.rStatus || "Available"),
                        capacity: backendRoom?.capacity || 0
                      };
                    });
                    
                    setAllRooms(updatedRooms);
                    roomCache.set(cacheKey, updatedRooms);
                    setLastRefresh(new Date());
                  } catch (error) {
                    console.error('Refresh failed:', error);
                  }
                }}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-gray-700/50 hover:bg-gray-600/70 text-white'
                }`}
                title="Refresh room data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className={`${
                theme === 'dark' ? 'text-white/60' : 'text-gray-800'
              }`}>Loading rooms...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredRooms
                .sort((a, b) => parseInt(a.rNo) - parseInt(b.rNo))
                .map(room => (
                <button
                  key={`${room.rNo}-${room.bNo}`}
                  onClick={room.rStatus === "Maintenance" ? undefined : () => handleRoomClick(room)}
                  className={`
                    backdrop-blur-sm rounded-xl px-3 py-4 border transition-all duration-200 text-left
                    ${room.rStatus === "Maintenance"
                      ? "cursor-not-allowed opacity-60" 
                      : "hover:scale-105 cursor-pointer"
                    }
                    ${getStatusColor(room.rStatus)}
                  `}
                  disabled={room.rStatus === "Maintenance"}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{room.rNo}</span>
                      <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                    </div>
                    <div className="text-xs opacity-80 capitalize">
                      {room.rType}
                    </div>
                    <div className="text-xs opacity-60 capitalize">
                      {room.rStatus}
                    </div>
                    {room.rStatus === 'Booked' && (
                      <div className="text-xs text-blue-300 opacity-80">
                        Click for other times
                      </div>
                    )}
                    {room.capacity && room.capacity > 0 && (
                      <div className="text-xs opacity-60">
                        Cap: {room.capacity}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`mt-12 p-4 backdrop-blur-sm rounded-xl border ${
          theme === 'dark'
            ? 'bg-white/10 border-white/20'
            : 'bg-gray-800/90 border-gray-600 shadow-lg'
        }`}>
          <h3 className="text-white font-medium mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500/60"></div>
              <span className="text-green-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/60"></div>
              <span className="text-red-300">Currently Booked (Click for other times)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-500/40 border border-gray-500/60"></div>
              <span className="text-gray-300">Maintenance (Not Clickable)</span>
            </div>
          </div>
        </div>

        {showBookingModal && selectedRoom && (
          <CompactRoomBookingModal
            room={selectedRoom}
            onClose={() => setShowBookingModal(false)}
            onSwap={handleBooking}
            onSchedule={handleScheduling}
            onWishlist={handleWishlist}
          />
        )}
      </div>
    </div>
  );
}