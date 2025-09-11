import { Palette, Moon, Sun, Monitor, Volume2, Bell, Shield, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { SharedSidebar } from "./SharedSidebar";
import { useTheme } from "../contexts/ThemeContext";

interface SettingsInterfaceProps {
  onClose: () => void;
  onHome?: () => void;
  onAccount?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
}

export function SettingsInterface({ onClose, onHome, onAccount, onAdmin, onLogout }: SettingsInterfaceProps) {
  const { theme, toggleTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState("dark");
  const [notifications, setNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [language, setLanguage] = useState("english");
  const [autoBookingReminders, setAutoBookingReminders] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load settings from database
        const response = await fetch('http://localhost:3001/api/auth/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const settings = await response.json();
          setLocalTheme(settings.theme || 'dark');
          setNotifications(settings.notifications || false);
          setLanguage(settings.language || 'english');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
      
      // Load all settings from localStorage
      const savedNotifications = localStorage.getItem("notifications") === "true";
      const savedSoundEnabled = localStorage.getItem("soundEnabled") === "true";
      const savedAutoBookingReminders = localStorage.getItem("autoBookingReminders") === "true";
      const savedEmailNotifications = localStorage.getItem("emailNotifications") === "true";
      const savedTwoFactorEnabled = localStorage.getItem("twoFactorEnabled") === "true";
      
      setNotifications(savedNotifications);
      setSoundEnabled(savedSoundEnabled);
      setAutoBookingReminders(savedAutoBookingReminders);
      setEmailNotifications(savedEmailNotifications);
      setTwoFactorEnabled(savedTwoFactorEnabled);
      
      console.log('Settings loaded:', { notifications: savedNotifications, sound: savedSoundEnabled });
      
      // Apply notification permissions
      if (notifications && 'Notification' in window) {
        Notification.requestPermission();
      }
    };
    
    loadSettings();
    
    // Start reminder system if enabled
    const savedAutoReminders = localStorage.getItem("autoBookingReminders") === "true";
    if (savedAutoReminders) {
      startBookingReminderSystem();
    }
    
    // Cleanup on unmount
    return () => {
      stopBookingReminderSystem();
    };
  }, []);

  const applyTheme = (selectedTheme: string) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes
    root.classList.remove("dark", "light");
    body.classList.remove("dark-theme", "light-theme");
    
    if (selectedTheme === "light") {
      root.classList.add("light");
      body.classList.add("light-theme");
      body.style.background = "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)";
      body.style.color = "#1e293b";
    } else if (selectedTheme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark-theme");
      body.style.background = "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)";
      body.style.color = "#f8fafc";
    } else {
      // System theme
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) {
        root.classList.add("dark");
        body.classList.add("dark-theme");
        body.style.background = "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)";
        body.style.color = "#f8fafc";
      } else {
        root.classList.add("light");
        body.classList.add("light-theme");
        body.style.background = "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)";
        body.style.color = "#1e293b";
      }
    }
  };

  const handleThemeChange = async (selectedTheme: string) => {
    setLocalTheme(selectedTheme);
    if (selectedTheme === 'light' || selectedTheme === 'dark') {
      toggleTheme();
    }
    
    // Save to database
    try {
      await fetch('http://localhost:3001/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ theme: selectedTheme })
      });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value);
    localStorage.setItem("notifications", value.toString());
    
    if (value && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('SmartDesk', {
          body: 'Push notifications enabled successfully!',
          icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3CradialGradient id='bg' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23fbbf24'/%3E%3Cstop offset='50%25' stop-color='%23f97316'/%3E%3Cstop offset='100%25' stop-color='%23ef4444'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='24' cy='24' r='24' fill='url(%23bg)'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' font-weight='700' fill='%23374151' fill-opacity='0.8'%3ESD%3C/text%3E%3C/svg%3E"
        });
      } else {
        alert('Notification permission denied. Please enable in browser settings.');
        setNotifications(false);
        localStorage.setItem("notifications", "false");
        return;
      }
    }
    
    console.log(`Notifications ${value ? 'enabled' : 'disabled'}`);
  };

  const handleSoundToggle = async (value: boolean) => {
    try {
      setSoundEnabled(value);
      localStorage.setItem("soundEnabled", value.toString());
      
      if (value) {
        // Play the actual notification sound
        const audio = new Audio('/assets/sounds/notification sound.wav');
        audio.volume = 1.0;
        await audio.play();
        console.log('Sound test played successfully');
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
      // Revert the toggle if sound fails
      setSoundEnabled(false);
      localStorage.setItem("soundEnabled", "false");
      alert('Sound file not found or failed to play. Please check if the notification sound file exists.');
    }
  };

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    
    // Save to database
    try {
      await fetch('http://localhost:3001/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ language: lang })
      });
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  };

  const handleAutoBookingRemindersToggle = (value: boolean) => {
    setAutoBookingReminders(value);
    localStorage.setItem("autoBookingReminders", value.toString());
    
    if (value) {
      // Start reminder system
      startBookingReminderSystem();
      console.log('Auto booking reminders enabled - will notify 15 minutes before bookings');
      alert('Auto reminders enabled! You will receive notifications 15 minutes before your bookings.');
    } else {
      // Stop reminder system
      stopBookingReminderSystem();
      console.log('Auto booking reminders disabled');
    }
  };

  // Booking reminder system
  let reminderInterval: NodeJS.Timeout | null = null;

  const startBookingReminderSystem = () => {
    // Check every minute for upcoming bookings
    reminderInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/bookings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const bookings = await response.json();
          checkUpcomingBookings(bookings);
        }
      } catch (error) {
        console.error('Failed to check bookings for reminders:', error);
      }
    }, 60000); // Check every minute
  };

  const stopBookingReminderSystem = () => {
    if (reminderInterval) {
      clearInterval(reminderInterval);
      reminderInterval = null;
    }
  };

  const checkUpcomingBookings = (bookings: any[]) => {
    const now = new Date();
    const reminderTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    bookings.forEach(booking => {
      if (booking.status === 'confirmed') {
        const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
        const timeDiff = bookingStart.getTime() - now.getTime();
        
        // If booking starts in 14-16 minutes (1 minute window)
        if (timeDiff > (reminderTime - 60000) && timeDiff <= reminderTime) {
          sendBookingReminder(booking);
        }
      }
    });
  };

  const sendBookingReminder = (booking: any) => {
    const message = `Reminder: Your booking for Room ${booking.rNo} in Building ${booking.bNo} starts in 15 minutes!`;
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SmartDesk Booking Reminder', {
        body: message,
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3CradialGradient id='bg' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23fbbf24'/%3E%3Cstop offset='50%25' stop-color='%23f97316'/%3E%3Cstop offset='100%25' stop-color='%23ef4444'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='24' cy='24' r='24' fill='url(%23bg)'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-family='Arial,sans-serif' font-size='14' font-weight='700' fill='%23374151' fill-opacity='0.8'%3ESD%3C/text%3E%3C/svg%3E",
        tag: `booking-reminder-${booking.bookingId}`,
        requireInteraction: true
      });
    }
    
    // Play sound if enabled
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    if (soundEnabled) {
      const audio = new Audio('/assets/sounds/notification sound.wav');
      audio.volume = 1.0;
      audio.play().catch(console.error);
    }
    
    console.log('Booking reminder sent:', message);
  };

  const handleEmailNotificationsToggle = (value: boolean) => {
    setEmailNotifications(value);
    localStorage.setItem("emailNotifications", value.toString());
    
    if (value) {
      console.log('Email notifications enabled');
      alert('Email notifications enabled! You will receive booking confirmations and updates via email.');
    } else {
      console.log('Email notifications disabled');
    }
  };

  const handleTwoFactorToggle = (value: boolean) => {
    setTwoFactorEnabled(value);
    localStorage.setItem("twoFactorEnabled", value.toString());
    
    if (value) {
      console.log('Two-Factor Authentication enabled');
      alert('Two-Factor Authentication enabled! Your account is now more secure.');
    } else {
      console.log('Two-Factor Authentication disabled');
      alert('Two-Factor Authentication disabled.');
    }
  };

  const settingsSections = [
    {
      title: "Appearance",
      icon: <Palette className="w-5 h-5" />,
      settings: [
        {
          title: "Theme",
          description: "Choose your preferred color scheme",
          content: (
            <div className="flex gap-2">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  theme === "light" 
                    ? "bg-blue-500/30 border border-blue-400/40" 
                    : "bg-white/10 border border-white/20 hover:bg-white/20"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm">Light</span>
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  theme === "dark" 
                    ? "bg-blue-500/30 border border-blue-400/40" 
                    : "bg-white/10 border border-white/20 hover:bg-white/20"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm">Dark</span>
              </button>
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  theme === "system" 
                    ? "bg-white/30 border border-white/40" 
                    : "bg-white/10 border border-white/20 hover:bg-white/20"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-sm">System</span>
              </button>
            </div>
          )
        }
      ]
    },
    {
      title: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          title: "Push Notifications",
          description: "Receive notifications about bookings and updates",
          content: (
            <button
              onClick={() => handleNotificationToggle(!notifications)}
              className={`w-12 h-6 rounded-full transition-all ${
                notifications ? "bg-blue-500" : "bg-white/20"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                notifications ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          )
        },
        {
          title: "Sound Effects",
          description: "Play sounds for interactions and notifications",
          content: (
            <button
              onClick={() => handleSoundToggle(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${
                soundEnabled ? "bg-blue-500" : "bg-white/20"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                soundEnabled ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          )
        },
        {
          title: "Auto Booking Reminders",
          description: "Automatically remind you 15 minutes before your bookings",
          content: (
            <button
              onClick={() => handleAutoBookingRemindersToggle(!autoBookingReminders)}
              className={`w-12 h-6 rounded-full transition-all ${
                autoBookingReminders ? "bg-blue-500" : "bg-white/20"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                autoBookingReminders ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          )
        },
        {
          title: "Email Notifications",
          description: "Receive booking confirmations and updates via email",
          content: (
            <button
              onClick={() => handleEmailNotificationsToggle(!emailNotifications)}
              className={`w-12 h-6 rounded-full transition-all ${
                emailNotifications ? "bg-blue-500" : "bg-white/20"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                emailNotifications ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          )
        }
      ]
    },
    {
      title: "General",
      icon: <Globe className="w-5 h-5" />,
      settings: [
        {
          title: "Language",
          description: "Choose your preferred language",
          content: (
            <select 
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="english" className="bg-gray-800 text-white">English</option>
              <option value="spanish" className="bg-gray-800 text-white">Spanish</option>
              <option value="french" className="bg-gray-800 text-white">French</option>
              <option value="german" className="bg-gray-800 text-white">German</option>
            </select>
          )
        }
      ]
    },
    {
      title: "Account & Security",
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          title: "Change Password",
          description: "Update your account password",
          content: (
            <button 
              onClick={async () => {
                const currentPassword = prompt('Enter current password:');
                if (!currentPassword) return;
                
                const newPassword = prompt('Enter new password (min 6 characters):');
                if (!newPassword) return;
                
                if (newPassword.length < 6) {
                  alert('Password must be at least 6 characters long.');
                  return;
                }
                
                try {
                  const response = await fetch('http://localhost:3001/api/auth/change-password', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ 
                      currentPassword, 
                      newPassword 
                    })
                  });
                  
                  if (response.ok) {
                    alert('Password updated successfully!');
                  } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to update password');
                  }
                } catch (error) {
                  alert('Failed to update password. Please try again.');
                }
              }}
              className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white text-sm hover:bg-white/25 transition-all"
            >
              Change Password
            </button>
          )
        },
        {
          title: "Two-Factor Authentication",
          description: "Add an extra layer of security to your account",
          content: (
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (!twoFactorEnabled) {
                    // Check if phone number exists
                    try {
                      const response = await fetch('http://localhost:3001/api/auth/profile', {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                      });
                      
                      if (response.ok) {
                        const userData = await response.json();
                        if (!userData.phoneNumber) {
                          alert('Please add your phone number in the Account section before enabling Two-Factor Authentication.');
                          return;
                        }
                        
                        const enteredPhone = prompt(`Enter your phone number to enable 2FA:\n(Saved: ${userData.phoneNumber})`);
                        if (enteredPhone !== userData.phoneNumber) {
                          alert('Phone number does not match. Please try again.');
                          return;
                        }
                        
                        handleTwoFactorToggle(true);
                      }
                    } catch (error) {
                      alert('Failed to verify phone number. Please try again.');
                    }
                  } else {
                    handleTwoFactorToggle(false);
                  }
                }}
                className={`w-12 h-6 rounded-full transition-all ${
                  twoFactorEnabled ? "bg-green-500" : "bg-white/20"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  twoFactorEnabled ? "translate-x-6" : "translate-x-0.5"
                }`} />
              </button>
              <span className={`text-sm ${twoFactorEnabled ? "text-green-300" : "text-white/60"}`}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          )
        },
        {
          title: "Delete Account",
          description: "Permanently delete your account and all associated data",
          content: (
            <button 
              onClick={async () => {
                const confirmation = prompt('Type "DELETE" to confirm account deletion:');
                if (confirmation !== 'DELETE') {
                  alert('Account deletion cancelled.');
                  return;
                }
                
                const finalConfirm = confirm('Are you absolutely sure? This action cannot be undone!');
                if (!finalConfirm) return;
                
                try {
                  const response = await fetch('http://localhost:3001/api/auth/delete-account', {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  
                  if (response.ok) {
                    alert('Account deleted successfully.');
                    localStorage.clear();
                    window.location.href = '/';
                  } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to delete account');
                  }
                } catch (error) {
                  alert('Failed to delete account. Please try again.');
                }
              }}
              className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30 rounded-lg px-4 py-2 text-red-300 text-sm transition-all"
            >
              Delete Account
            </button>
          )
        }
      ]
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHI+PIKdlbCJ3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative z-10 flex h-full">
        {/* Sidebar Navigation */}
        <SharedSidebar
          title="Settings"
          activeSection="settings"
          onClose={onClose}
          onHome={onHome}
          onAccount={onAccount}
          onSettings={() => {}}
          onAdmin={onAdmin}
          onLogout={onLogout}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">

            {/* Settings Sections */}
            <div className="space-y-6">
          {settingsSections.map((section, index) => (
            <div key={index} className={`backdrop-blur-sm rounded-2xl p-6 border ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-gray-800/90 border-gray-600 shadow-lg'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-white/20' : 'bg-white/30'
                }`}>
                  {section.icon}
                </div>
                <h2 className="text-xl font-medium text-white">{section.title}</h2>
              </div>
              
              <div className="space-y-4">
                {section.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className={`flex items-center justify-between p-4 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/10 border-white/20'
                  }`}>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{setting.title}</h3>
                      <p className="text-white/60 text-sm">{setting.description}</p>
                    </div>
                    <div className="ml-4">
                      {setting.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

            {/* About Section */}
            <div className={`mt-8 backdrop-blur-sm rounded-2xl p-6 border ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-gray-800/90 border-gray-600 shadow-lg'
            }`}>
              <h2 className="text-xl font-medium text-white mb-4">About SmartDesk</h2>
              <div className="space-y-2 text-white/80">
                <p>Version: 1.0.0</p>
                <p>Build: 2025.09.09</p>
                <p>© 2025 SmartDesk. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}