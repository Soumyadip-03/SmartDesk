import { Palette, Moon, Sun, Monitor, Volume2, Bell, Shield, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { SharedSidebar } from "./SharedSidebar";

interface SettingsInterfaceProps {
  onClose: () => void;
  onHome?: () => void;
  onAccount?: () => void;
  onAdmin?: () => void;
  onLogout?: () => void;
}

export function SettingsInterface({ onClose, onHome, onAccount, onAdmin, onLogout }: SettingsInterfaceProps) {
  const [theme, setTheme] = useState("dark");
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
          setTheme(settings.theme || 'dark');
          setNotifications(settings.notifications || false);
          setLanguage(settings.language || 'english');
          applyTheme(settings.theme || 'dark');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
      
      // Fallback to localStorage for other settings
      const savedSoundEnabled = localStorage.getItem("soundEnabled") === "true";
      const savedAutoBookingReminders = localStorage.getItem("autoBookingReminders") === "true";
      const savedEmailNotifications = localStorage.getItem("emailNotifications") === "true";
      const savedTwoFactorEnabled = localStorage.getItem("twoFactorEnabled") === "true";
      
      setSoundEnabled(savedSoundEnabled);
      setAutoBookingReminders(savedAutoBookingReminders);
      setEmailNotifications(savedEmailNotifications);
      setTwoFactorEnabled(savedTwoFactorEnabled);
      
      // Apply notification permissions
      if (notifications && 'Notification' in window) {
        Notification.requestPermission();
      }
    };
    
    loadSettings();
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
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
    applyTheme(selectedTheme);
    
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
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('SmartDesk', {
            body: 'Notifications enabled successfully!',
            icon: '/favicon.ico'
          });
        }
      });
    }
    
    // Save to database
    try {
      await fetch('http://localhost:3001/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notifications: value })
      });
    } catch (error) {
      console.error('Failed to save notification setting:', error);
    }
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    localStorage.setItem("soundEnabled", value.toString());
    
    if (value) {
      // Play a test sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {});
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
  };

  const handleEmailNotificationsToggle = (value: boolean) => {
    setEmailNotifications(value);
    localStorage.setItem("emailNotifications", value.toString());
  };

  const handleTwoFactorToggle = (value: boolean) => {
    setTwoFactorEnabled(value);
    localStorage.setItem("twoFactorEnabled", value.toString());
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
                    ? "bg-white/30 border border-white/40" 
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
                    ? "bg-white/30 border border-white/40" 
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white z-50">
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
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg">
                  {section.icon}
                </div>
                <h2 className="text-xl font-medium text-white">{section.title}</h2>
              </div>
              
              <div className="space-y-4">
                {section.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
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
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-medium text-white mb-4">About SmartDesk</h2>
              <div className="space-y-2 text-white/80">
                <p>Version: 1.0.0</p>
                <p>Build: 2025.09.01</p>
                <p>© 2025 SmartDesk. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}