import { Heart, Home, MapPin, Users, Clock } from "lucide-react";
import { useState } from "react";
import { CompactRoomBookingModal } from "./CompactRoomBookingModal";
import { useTheme } from "../contexts/ThemeContext";

interface WishlistRoom {
  rNo: string;
  bNo: number;
  rType: string;
  rStatus: string;
  capacity?: number;
  floor?: number;
}

interface WishlistInterfaceProps {
  wishlistRooms: WishlistRoom[];
  onClose: () => void;
  onRemoveFromWishlist: (roomNumber: string, buildingNumber: number) => Promise<void>;
  onHome: () => void;
  onBooking: (bookingData: any) => Promise<any>;
}

export function WishlistInterface({ 
  wishlistRooms, 
  onClose: _onClose,
  onRemoveFromWishlist,
  onHome,
  onBooking 
}: WishlistInterfaceProps) {
  const { theme } = useTheme();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<WishlistRoom | null>(null);
  
  const handleRemoveFromWishlist = (roomNumber: string, buildingNumber: number) => {
    if (confirm('Remove this room from your wishlist?')) {
      onRemoveFromWishlist(roomNumber, buildingNumber);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'text-green-400 bg-green-500/20 border-green-500/40';
      case 'occupied':
        return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'maintenance':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      default:
        return 'text-gray-400 bg-white/10 border-white/20';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHI+PIKdlbCJ3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative z-10 p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl border border-red-500/30">
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>My Wishlist</h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-600'
              }`}>{wishlistRooms.length} rooms saved</p>
            </div>
          </div>
          
          {onHome && (
            <button 
              onClick={onHome}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-800/20'
              }`}
              title="Go Home"
            >
              <Home className={`w-5 h-5 ${
                theme === 'dark' ? 'text-white/80' : 'text-gray-700'
              }`} />
            </button>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className={`p-6 backdrop-blur-sm rounded-3xl border mb-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10'
                : 'bg-gradient-to-br from-gray-800/90 to-gray-700/90 border-gray-600 shadow-lg'
            }`}>
              <Heart className="w-16 h-16 text-white/40 mx-auto" />
            </div>
            <h3 className={`text-xl font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>No rooms in wishlist</h3>
            <p className={`text-center max-w-md ${
              theme === 'dark' ? 'text-white/60' : 'text-gray-600'
            }`}>
              Start adding rooms to your wishlist by clicking the heart icon when viewing room details.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistRooms.map((room) => (
              <div 
                key={`${room.rNo}-${room.bNo}`}
                className={`backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 group ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-white/20 to-white/10 border-white/10 hover:from-white/25 hover:to-white/15'
                    : 'bg-gradient-to-br from-gray-800/90 to-gray-700/90 border-gray-600 hover:from-gray-800/95 hover:to-gray-700/95 shadow-lg'
                }`}
              >
                {/* Room Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Room {room.rNo}</h3>
                    <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>Building {room.bNo}</span>
                      {room.floor && <span>• Floor {room.floor}</span>}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(room.rNo, room.bNo)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-xl border border-red-500/30 transition-all group-hover:scale-105"
                    title="Remove from wishlist"
                  >
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                  </button>
                </div>

                {/* Room Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Type</span>
                    <span className="text-white font-medium capitalize">{room.rType}</span>
                  </div>
                  
                  {room.capacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Capacity
                      </span>
                      <span className="text-white font-medium">{room.capacity || 0} people</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Status
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(room.rStatus)}`}>
                      {room.rStatus}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      if (room.rStatus.toLowerCase() === 'available') {
                        setSelectedRoom(room);
                        setShowBookingModal(true);
                      }
                    }}
                    className={`w-full py-2 px-4 rounded-xl font-medium transition-all ${
                      room.rStatus.toLowerCase() === 'available'
                        ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40'
                        : 'bg-white/10 hover:bg-white/20 text-white/60 border border-white/20 cursor-not-allowed'
                    }`}
                    disabled={room.rStatus.toLowerCase() !== 'available'}
                  >
                    {room.rStatus.toLowerCase() === 'available' ? 'Book Now' : 'Not Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <CompactRoomBookingModal
          room={{
            rNo: selectedRoom.rNo,
            bNo: selectedRoom.bNo,
            rType: selectedRoom.rType,
            rStatus: selectedRoom.rStatus,
            capacity: selectedRoom.capacity || 0
          }}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedRoom(null);
          }}
          onSwap={async (bookingData) => {
            const completeBookingData = {
              ...bookingData,
              roomNumber: selectedRoom.rNo,
              buildingNumber: selectedRoom.bNo.toString()
            };
            await onBooking(completeBookingData);
            setShowBookingModal(false);
            setSelectedRoom(null);
          }}
          onSchedule={async (bookingData) => {
            const completeBookingData = {
              ...bookingData,
              roomNumber: selectedRoom.rNo,
              buildingNumber: selectedRoom.bNo.toString()
            };
            await onBooking(completeBookingData);
            setShowBookingModal(false);
            setSelectedRoom(null);
          }}
          onWishlist={async () => {
            // Already in wishlist, do nothing
          }}
        />
      )}
    </div>
  );
}