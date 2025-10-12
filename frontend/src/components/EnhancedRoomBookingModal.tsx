import { useState } from 'react';
import { X, Clock, Calendar, MapPin, Users, BookOpen, Repeat } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Room {
  rNo: string;
  bNo: number;
  rType: string;
  rStatus: string;
  capacity?: number;
  floor?: number;
}

interface EnhancedRoomBookingModalProps {
  room: Room;
  onClose: () => void;
  onBook: (bookingData: any) => Promise<void>;
  onSchedule: (bookingData: any) => Promise<void>;
  onWishlist: (room: Room) => Promise<void>;
  onSwapRoom?: (newRoom: Room) => Promise<void>;
}

export const EnhancedRoomBookingModal = ({ 
  room, 
  onClose, 
  onBook, 
  onSchedule, 
  onWishlist,
  onSwapRoom 
}: EnhancedRoomBookingModalProps) => {
  const { theme } = useTheme();
  const [bookingType, setBookingType] = useState<'now' | 'later'>('now');
  const [formData, setFormData] = useState({
    facultyName: JSON.parse(localStorage.getItem('user') || '{}').name || '',
    courseSubject: '',
    numberOfStudents: '',
    date: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    startTime: '',
    endTime: '',
    purpose: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const bookingData = {
        roomNumber: room.rNo,
        buildingNumber: room.bNo.toString(),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        bookingType,
        purpose: formData.purpose,
        notes: formData.notes,
        facultyName: formData.facultyName,
        courseSubject: formData.courseSubject,
        numberOfStudents: formData.numberOfStudents
      };

      if (bookingType === 'now') {
        await onBook(bookingData);
      } else {
        await onSchedule(bookingData);
      }
      onClose();
    } catch (err: any) {
      let errorMessage = 'Failed to create booking';
      
      if (err.message) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (err.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('already booked')) {
          errorMessage = 'This room is already booked for the selected time.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className={`rounded-xl p-3 w-full max-w-xl max-h-[95vh] overflow-y-auto border ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20'
          : 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-600 shadow-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-500/20 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Room {room.rNo}</h2>
              <p className="text-white/60 text-xs">Building {room.bNo} • {room.rType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Room Info */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">Capacity</span>
            </div>
            <span className="text-white text-sm font-medium">{room.capacity || 0} students</span>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">Status</span>
            </div>
            <span className={`font-medium ${
              room.rStatus === 'Available' ? 'text-green-400' :
              room.rStatus === 'Booked' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {room.rStatus}
            </span>
          </div>
        </div>

        {/* Booking Type Selection */}
        <div className="mb-3">
          <label className="block text-white text-sm font-medium mb-2">Booking Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBookingType('now')}
              className={`p-4 rounded-xl border-2 transition-all ${
                bookingType === 'now'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-white/20 bg-white/5 text-white/60 hover:border-white/30'
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-2" />
              <div className="font-medium">Book Now</div>
              <div className="text-xs opacity-80">Immediate booking</div>
            </button>
            <button
              type="button"
              onClick={() => setBookingType('later')}
              className={`p-4 rounded-xl border-2 transition-all ${
                bookingType === 'later'
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-white/20 bg-white/5 text-white/60 hover:border-white/30'
              }`}
            >
              <Calendar className="w-5 h-5 mx-auto mb-2" />
              <div className="font-medium">Book for Later</div>
              <div className="text-xs opacity-80">Schedule booking</div>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Faculty Name</label>
              <input
                type="text"
                name="facultyName"
                value={formData.facultyName}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 cursor-not-allowed"
                placeholder="Auto-filled from account"
                readOnly
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Course/Subject</label>
              <input
                type="text"
                name="courseSubject"
                value={formData.courseSubject}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Enter course/subject"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                onInput={(e) => {
                  const selectedDate = new Date(e.currentTarget.value + 'T00:00:00');
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (selectedDate < today) {
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    const todayStr = `${year}-${month}-${day}`;
                    e.currentTarget.value = todayStr;
                    setFormData(prev => ({ ...prev, date: todayStr }));
                  }
                }}
                className={`w-full border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  bookingType === 'now' 
                    ? 'bg-white/5 cursor-not-allowed text-white/50' 
                    : 'bg-white/10'
                }`}
                disabled={bookingType === 'now'}
                required={bookingType === 'later'}
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Number of Students</label>
              <input
                type="number"
                name="numberOfStudents"
                value={formData.numberOfStudents}
                onChange={handleInputChange}
                min="1"
                max={room.capacity || 100}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Number of students"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Purpose</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [&>option]:bg-gray-800 [&>option]:text-white"
                required
              >
                <option value="" className="bg-gray-800 text-white">Select purpose</option>
                <option value="Lecture" className="bg-gray-800 text-white">Lecture</option>
                <option value="Lab Session" className="bg-gray-800 text-white">Lab Session</option>
                <option value="Meeting" className="bg-gray-800 text-white">Meeting</option>
                <option value="Seminar" className="bg-gray-800 text-white">Seminar</option>
                <option value="Workshop" className="bg-gray-800 text-white">Workshop</option>
                <option value="Exam" className="bg-gray-800 text-white">Exam</option>
                <option value="Other" className="bg-gray-800 text-white">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              placeholder="Any additional requirements or notes... (Optional)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={room.rStatus === 'Maintenance' || isSubmitting}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                bookingType === 'now'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${
                room.rStatus === 'Maintenance' || isSubmitting
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Processing...' : (bookingType === 'now' ? 'Book Now' : 'Schedule Booking')}
            </button>
            
            <button
              type="button"
              onClick={async () => {
                try {
                  await onWishlist(room);
                  setError(null);
                } catch (err: any) {
                  setError(err.message || 'Failed to add to wishlist');
                }
              }}
              disabled={isSubmitting}
              className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl font-medium transition-all hover:scale-105 border border-purple-500/30 disabled:opacity-50"
            >
              Add to Wishlist
            </button>
          </div>
        </form>

        {/* Additional Actions */}
        {onSwapRoom && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <button
              onClick={() => {/* Implement swap room logic */}}
              className="w-full py-2 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg font-medium transition-all border border-yellow-500/30"
            >
              <Repeat className="w-4 h-4 inline mr-2" />
              Swap to Different Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};