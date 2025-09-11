import { Calendar, Save, User } from "lucide-react";
import { useState, useEffect } from "react";
import { SharedSidebar } from "./SharedSidebar";
import { useTheme } from "../contexts/ThemeContext";

interface AccountInterfaceProps {
  onClose: () => void;
  onHome?: () => void;
  onSettings?: () => void;
  onWishlist?: () => void;
  onNotifications?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
  onUserNameUpdate?: (name: string) => void;
  bookings?: any[];
  wishlistCount?: number;
  onShowBookings?: () => void;
}

export function AccountInterface({ onClose, onHome, onSettings, onWishlist, onNotifications, onAdmin, onLogout, onUserNameUpdate, bookings = [], wishlistCount = 0, onShowBookings }: AccountInterfaceProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    username: '',
    fullName: '',
    email: '',
    facultyId: '',
    establishmentId: '',
    establishment: '',
    role: 'moderator',
    department: '',
    language: 'English',
    phone: '',
    profilePicture: ''
  });

  useEffect(() => {
    const loadProfileData = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const facultyId = user.facultyId || 'guest';
      const firstName = user.name ? user.name.split(' ')[0] : '';
      
      setProfileData({
        username: firstName,
        fullName: user.name || '',
        email: user.email || '',
        facultyId: user.facultyId || '',
        establishmentId: user.establishmentId || '',
        establishment: user.establishment || '',
        role: user.role || 'moderator',
        department: user.department || localStorage.getItem(`${facultyId}_department`) || '',
        language: localStorage.getItem(`${facultyId}_language`) || 'English',
        phone: user.phoneNumber?.toString() || localStorage.getItem(`${facultyId}_phone`) || '',
        profilePicture: user.profilePicture || localStorage.getItem(`${facultyId}_profilePicture`) || ''
      });
    };
    
    loadProfileData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const facultyId = user.facultyId || 'guest';
    
    try {
      // Save to localStorage first
      localStorage.setItem(`${facultyId}_department`, profileData.department || '');
      localStorage.setItem(`${facultyId}_phone`, profileData.phone || '');
      localStorage.setItem(`${facultyId}_language`, profileData.language || 'English');
      
      // Update user object in localStorage
      const updatedUser = {
        ...user,
        department: profileData.department,
        phoneNumber: parseInt(profileData.phone) || null,
        name: profileData.fullName,
        username: profileData.username
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Profile saved successfully!');
      
      // Sync to database in background (don't wait for response)
      console.log('Starting background sync to database...');
      fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: profileData.fullName,
          department: profileData.department,
          phoneNumber: profileData.phone ? parseInt(profileData.phone) : null,
          username: profileData.username,
          profilePicture: localStorage.getItem('profilePhoto') || null
        })
      }).then(response => {
        if (response.ok) {
          console.log('✅ Database sync successful');
        } else {
          console.log('❌ Database sync failed:', response.status);
        }
      }).catch(error => {
        console.log('❌ Background sync error:', error);
      });
      
      if (onUserNameUpdate) {
        onUserNameUpdate(profileData.fullName);
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/10'
                : 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-gray-600 shadow-lg'
            }`}>
              <div className="flex items-start gap-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-2 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'border-white/20' : 'border-gray-400'
                  }`}>
                    <User className="w-12 h-12 text-white/80" />
                  </div>
                  <button 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const result = e.target?.result as string;
                            localStorage.setItem('profilePhoto', result);
                            alert('Profile photo updated!');
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all border border-white/20"
                  >
                    Change Photo
                  </button>
                </div>
                
                {/* Profile Form Fields */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Username (From Signup)</label>
                      <input 
                        type="text"
                        value={profileData.username}
                        readOnly
                        className="w-full bg-white/5 backdrop-blur-sm text-white/70 border border-white/10 rounded-lg px-4 py-3 cursor-not-allowed"
                        placeholder="Auto-filled from signup"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Role</label>
                      <input 
                        type="text"
                        value={profileData.role || 'moderator'}
                        readOnly
                        className="w-full bg-white/5 backdrop-blur-sm text-white/70 border border-white/10 rounded-lg px-4 py-3 cursor-not-allowed capitalize"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Department</label>
                      <input 
                        type="text"
                        value={profileData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                      />
                    </div>
                  </div>
                  

                </div>
              </div>
            </div>

            {/* Personal Info Section */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/10'
                : 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-gray-600 shadow-lg'
            }`}>
              <h3 className="text-white text-lg font-medium mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Full Name (From Signup)</label>
                  <input 
                    type="text"
                    value={profileData.fullName}
                    readOnly
                    className="w-full bg-white/5 backdrop-blur-sm text-white/70 border border-white/10 rounded-lg px-4 py-3 cursor-not-allowed"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Establishment (From Signup)</label>
                    <input 
                      type="text"
                      value={profileData.establishment}
                      readOnly
                      className="w-full bg-white/5 backdrop-blur-sm text-white/70 border border-white/10 rounded-lg px-4 py-3 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Establishment ID (From Signup)</label>
                    <input 
                      type="text"
                      value={profileData.establishmentId || ''}
                      readOnly
                      className="w-full bg-white/5 backdrop-blur-sm text-white/70 border border-white/10 rounded-lg px-4 py-3 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Faculty ID (From Signup)</label>
                    <input 
                      type="text"
                      value={profileData.facultyId}
                      readOnly
                      className="w-full bg-white/5 backdrop-blur-sm text-white/70 border border-white/10 rounded-lg px-4 py-3 cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Language</label>
                    <select 
                      value={profileData.language}
                      onChange={(e) => handleInputChange("language", e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    >
                      <option value="English" className="bg-gray-800">English</option>
                      <option value="Spanish" className="bg-gray-800">Spanish</option>
                      <option value="French" className="bg-gray-800">French</option>
                      <option value="German" className="bg-gray-800">German</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info Section */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/10'
                : 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-gray-600 shadow-lg'
            }`}>
              <h3 className="text-white text-lg font-medium mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Email (From Signup)</label>
                  <input 
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="w-full bg-white/5 backdrop-blur-sm text-white/70 border border-white/10 rounded-lg px-4 py-3 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">Phone Number (Manual)</label>
                  <input 
                    type="number"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full md:w-2/3 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 backdrop-blur-sm text-green-400 px-6 py-3 rounded-xl transition-all border border-green-500/30"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        );

      case "bookings":
        return (
          <div className="space-y-6">
            <div className={`backdrop-blur-sm rounded-2xl p-8 border text-center ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/10'
                : 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-gray-600 shadow-lg'
            }`}>
              <Calendar className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-white text-xl font-medium mb-2">
                {bookings.length > 0 ? `${bookings.length} Bookings` : 'No Bookings Yet'}
              </h3>
              <p className="text-white/60 mb-6">
                {bookings.length > 0 
                  ? 'Click below to view and manage your room bookings.' 
                  : 'Your room bookings will appear here once you make some reservations.'}
              </p>
              {bookings.length > 0 && onShowBookings && (
                <button 
                  onClick={onShowBookings}
                  className="bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm text-blue-400 px-6 py-3 rounded-xl transition-all border border-blue-500/30"
                >
                  View All Bookings
                </button>
              )}
            </div>
          </div>
        );



      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aT0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHI+PIKdlbCJ3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative z-10 flex h-full">
        {/* Sidebar Navigation */}
        <SharedSidebar
          title="Account"
          activeSection="account"
          onClose={onClose}
          onHome={onHome}
          onAccount={() => {}}
          onSettings={onSettings}
          onWishlist={onWishlist}
          onNotifications={onNotifications}
          onAdmin={onAdmin}
          onLogout={onLogout}
          bookingsCount={bookings.length}
          wishlistCount={wishlistCount}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}