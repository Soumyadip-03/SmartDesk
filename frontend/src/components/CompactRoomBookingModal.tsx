import { useState, useEffect } from 'react';
import { X, Clock, Calendar, MapPin, Users, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Room {
  rNo: string;
  bNo: number;
  rType: string;
  rStatus: string;
  capacity?: number;
  floor?: number;
}

interface CompactRoomBookingModalProps {
  room: Room;
  onClose: () => void;
  onSwap: (bookingData: any) => Promise<void>;
  onSchedule: (bookingData: any) => Promise<void>;
  onWishlist: (room: Room) => Promise<void>;
}

export const CompactRoomBookingModal = ({ 
  room, 
  onClose, 
  onSwap, 
  onSchedule, 
  onWishlist
}: CompactRoomBookingModalProps) => {
  const { theme } = useTheme();
  const [bookingType, setBookingType] = useState<'swap' | 'later'>('swap');
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState(() => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    return {
      facultyName: user.name || '',
      courseSubject: '',
      numberOfStudents: '',
      date: getCurrentDate(),
      startTime: '',
      endTime: '',
      purpose: '',
      notes: '',
      currentRoom: ''
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force reset date to current date when modal opens
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: getCurrentDate()
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validate student count against room capacity
    const studentCount = parseInt(formData.numberOfStudents);
    const roomCapacity = room.capacity || 0;
    if (studentCount > roomCapacity) {
      setError(`The number of students are greater than the capability of room ${room.rNo}`);
      setIsSubmitting(false);
      return;
    }
    
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
        numberOfStudents: formData.numberOfStudents,
        currentRoom: formData.currentRoom
      };

      if (bookingType === 'swap') {
        await onSwap(bookingData);
      } else {
        await onSchedule(bookingData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-2">
      <div className={`rounded-xl p-4 w-full max-w-xl max-h-[95vh] overflow-y-auto border ${
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
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Room Info */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">Capacity</span>
            </div>
            <span className="text-white text-sm font-medium">{room.capacity || 0}</span>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">Status</span>
            </div>
            <span className={`text-sm font-medium ${
              room.rStatus === 'Available' ? 'text-green-400' :
              room.rStatus === 'Booked' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {room.rStatus}
            </span>
          </div>
        </div>

        {/* Booking Type */}
        <div className="mb-3">
          <label className="block text-white text-sm font-medium mb-1">Action Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBookingType('swap')}
              className={`p-2 rounded-lg border-2 transition-all ${
                bookingType === 'swap'
                  ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                  : 'border-white/20 bg-white/5 text-white/60 hover:border-white/30'
              }`}
            >
              <Clock className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-medium">Swap Room</div>
            </button>
            <button
              type="button"
              onClick={() => setBookingType('later')}
              className={`p-2 rounded-lg border-2 transition-all ${
                bookingType === 'later'
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-white/20 bg-white/5 text-white/60 hover:border-white/30'
              }`}
            >
              <Calendar className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-medium">Book Later</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 mb-2">
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-white/80 text-xs font-medium mb-1">Faculty</label>
              <input
                type="text"
                name="facultyName"
                value={formData.facultyName}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-white/80 text-xs font-medium mb-1">Subject</label>
              <input
                type="text"
                name="courseSubject"
                value={formData.courseSubject}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                placeholder="Course/Subject"
                required
              />
            </div>
          </div>

          {bookingType === 'swap' ? (
            <div>
              <label className="block text-white/80 text-xs font-medium mb-1">Current Room</label>
              <input
                type="text"
                name="currentRoom"
                value={formData.currentRoom}
                onChange={handleInputChange}
                placeholder="Room you're leaving"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                required
              />
              <p className="text-white/50 text-xs mt-1">Time will be auto-detected from your current booking</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-white/80 text-xs font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getCurrentDate()}
                  onInput={(e) => {
                    const selectedDate = new Date(e.currentTarget.value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                      e.currentTarget.value = getCurrentDate();
                      setFormData(prev => ({ ...prev, date: getCurrentDate() }));
                    }
                  }}
                  max="2030-12-31"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-medium mb-1">Start</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-medium mb-1">End</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  required
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-white/80 text-xs font-medium mb-1">Students</label>
              <input
                type="number"
                name="numberOfStudents"
                value={formData.numberOfStudents}
                onChange={handleInputChange}
                min="1"
                max={room.capacity || 100}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                placeholder="Count"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-xs font-medium mb-1">Purpose</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                required
              >
                <option value="">Select</option>
                <option value="Lecture">Lecture</option>
                <option value="Lab Session">Lab</option>
                <option value="Meeting">Meeting</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
                <option value="Exam">Exam</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-xs font-medium mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={room.rStatus === 'Maintenance' || isSubmitting}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                bookingType === 'swap'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${
                room.rStatus === 'Maintenance' || isSubmitting
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {isSubmitting ? 'Processing...' : (bookingType === 'swap' ? 'Swap Room' : 'Schedule')}
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
              className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-all border border-purple-500/30 disabled:opacity-50"
            >
              Wishlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};