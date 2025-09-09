import { Calendar, Clock, MapPin, User, X, Home, Trash2 } from "lucide-react";

interface Booking {
  id: string;
  roomNumber: string;
  buildingNumber: string;
  facultyName: string;
  courseSubject: string;
  numberOfStudents: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface BookingsInterfaceProps {
  bookings: Booking[];
  onClose: () => void;
  onHome?: () => void;
  onCancelBooking: (bookingId: string) => void;
  onDeleteBooking: (bookingId: string) => void;
}

export function BookingsInterface({ 
  bookings, 
  onClose, 
  onHome,
  onCancelBooking,
  onDeleteBooking 
}: BookingsInterfaceProps) {
  
  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      onCancelBooking(bookingId);
    }
  };
  
  const handleDeleteBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      onDeleteBooking(bookingId);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/20 border-green-500/40';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-500/40';
      default:
        return 'text-gray-400 bg-white/10 border-white/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    // Handle both time string formats
    if (timeString.includes('T')) {
      // ISO format like "1970-01-01T08:00:00.000Z"
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } else {
      // Simple time format like "08:00"
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.startTime}`);
    const dateB = new Date(`${b.date} ${b.startTime}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHI+PIKdlbCJ3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative z-10 p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl border border-blue-500/30">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">My Bookings</h1>
              <p className="text-white/60 text-sm">{bookings.length} total bookings</p>
            </div>
          </div>
          
          {onHome && (
            <button 
              onClick={onHome}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Go Home"
            >
              <Home className="w-5 h-5 text-white/80" />
            </button>
          )}
        </div>

        {/* Bookings Content */}
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/10 mb-6">
              <Calendar className="w-16 h-16 text-white/40 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No bookings yet</h3>
            <p className="text-white/60 text-center max-w-md">
              Your room bookings will appear here once you make some reservations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:from-white/25 hover:to-white/15 transition-all duration-300"
              >
                {/* Booking Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <MapPin className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Room {booking.roomNumber}</h3>
                      <p className="text-white/60 text-sm">Building {booking.buildingNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <div className="flex gap-2">
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 backdrop-blur-sm rounded-xl border border-yellow-500/30 transition-all"
                          title="Cancel booking"
                        >
                          <X className="w-4 h-4 text-yellow-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-xl border border-red-500/30 transition-all"
                        title="Delete booking"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-white/60" />
                      <span className="text-white/80 text-sm">Faculty:</span>
                      <span className="text-white font-medium">{booking.facultyName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="text-white/80 text-sm">Date:</span>
                      <span className="text-white font-medium">{formatDate(booking.date)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/60" />
                      <span className="text-white/80 text-sm">Time:</span>
                      <span className="text-white font-medium">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-white/60" />
                      <span className="text-white/80 text-sm">Students:</span>
                      <span className="text-white font-medium">{isNaN(Number(booking.numberOfStudents)) ? '0' : booking.numberOfStudents}</span>
                    </div>
                  </div>
                </div>

                {/* Course Subject and Purpose */}
                <div className="mb-4">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <span className="text-white/80 text-sm">Subject/Purpose: </span>
                    <span className="text-white font-medium">{booking.courseSubject || booking.purpose || 'N/A'}</span>
                  </div>
                </div>

                {/* Notes - Only show if exists */}
                {booking.notes && booking.notes.trim() && (
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-white/80 text-sm">Notes: </span>
                    <span className="text-white/90">{booking.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}