import { useState, useEffect } from 'react';
import { Shield, Users, Activity, Trash2, Settings, Search } from 'lucide-react';
import { SharedSidebar } from './SharedSidebar';

interface AdminDashboardProps {
  onClose: () => void;
  onHome?: () => void;
  onAccount?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export const AdminDashboard = ({ onClose, onHome, onAccount, onSettings, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('security');
  const [failedLogins, setFailedLogins] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [maintenanceStats, setMaintenanceStats] = useState({ totalRooms: 0, maintenanceRooms: 0, lastUpdated: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<{[key: string]: number}>({});
  
  const roomTypes = ['Undefined', 'Lecture Room', 'Computer Lab', 'Seminar Hall', 'Laboratory', 'Auditorium', 'Conference Room', 'Faculty Room'];
  const roomStatuses = ['Available', 'Booked', 'Maintenance'];
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showTagBox, setShowTagBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Check user authorization - only admin role allowed
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role !== 'admin') {
      setIsAuthorized(false);
      setError('Access denied. Admin role required.');
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isAuthorized) return;
    
    const refreshData = () => {
      if (activeTab === 'security') {
        fetchFailedLogins();
      } else if (activeTab === 'sessions') {
        fetchActiveSessions();
      } else if (activeTab === 'maintenance') {
        fetchMaintenanceStats();
      }
    };

    const interval = setInterval(refreshData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [activeTab, isAuthorized]);

  const fetchFailedLogins = async (force = false) => {
    if (!isAuthorized) return;
    
    // Debounce: prevent requests within 2 seconds
    const now = Date.now();
    const lastFetch = lastFetchTime.security || 0;
    if (!force && now - lastFetch < 2000) return;
    
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/analytics/security/failed-logins', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFailedLogins(data);
        setLastFetchTime(prev => ({ ...prev, security: now }));
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        setIsAuthorized(false);
      } else {
        setError('Failed to load security data.');
      }
    } catch (error) {
      console.error('Failed to fetch failed logins:', error);
      setError('Network error. Please try again.');
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  const fetchActiveSessions = async (force = false) => {
    if (!isAuthorized) return;
    
    // Debounce: prevent requests within 2 seconds
    const now = Date.now();
    const lastFetch = lastFetchTime.sessions || 0;
    if (!force && now - lastFetch < 2000) return;
    
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/analytics/sessions/active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data);
        setLastFetchTime(prev => ({ ...prev, sessions: now }));
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        setIsAuthorized(false);
      } else {
        setError('Failed to load session data.');
      }
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
      setError('Network error. Please try again.');
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  const fetchRooms = async (force = false) => {
    if (!isAuthorized) return;
    
    // Debounce: prevent requests within 2 seconds
    const now = Date.now();
    const lastFetch = lastFetchTime.rooms || 0;
    if (!force && now - lastFetch < 2000) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/rooms', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
        setLastFetchTime(prev => ({ ...prev, rooms: now }));
      } else if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        setIsAuthorized(false);
      } else {
        setError('Failed to load room data.');
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const updateRoomType = async (roomNumber: string, buildingNumber: string, roomType: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${roomNumber}/${buildingNumber}/type`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roomType })
      });
      if (response.ok) {
        setRooms(prev => prev.map((room: any) => 
          room.rNo === roomNumber && room.bNo.toString() === buildingNumber ? { ...room, rType: roomType } : room
        ));
        // Clear building cache to force refresh on home page
        if ((window as any).roomCache) {
          (window as any).roomCache.delete(`building-${buildingNumber}`);
        }
        alert('Room type updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update room type:', error);
      alert('Failed to update room type');
    }
  };

  const updateRoomStatus = async (roomNumber: string, buildingNumber: string, roomStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${roomNumber}/${buildingNumber}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roomStatus })
      });
      if (response.ok) {
        setRooms(prev => prev.map((room: any) => 
          room.rNo === roomNumber && room.bNo.toString() === buildingNumber ? { ...room, rStatus: roomStatus } : room
        ));
        // Clear building cache to force refresh on home page
        if ((window as any).roomCache) {
          (window as any).roomCache.delete(`building-${buildingNumber}`);
        }
        alert('Room status updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update room status:', error);
      alert('Failed to update room status');
    }
  };

  const updateRoomCapacity = async (roomNumber: string, buildingNumber: string, capacity: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/rooms/${roomNumber}/${buildingNumber}/capacity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ capacity })
      });
      if (response.ok) {
        setRooms(prev => prev.map((room: any) => 
          room.rNo === roomNumber && room.bNo.toString() === buildingNumber ? { ...room, capacity: parseInt(capacity) } : room
        ));
        // Clear building cache to force refresh on home page
        if ((window as any).roomCache) {
          (window as any).roomCache.delete(`building-${buildingNumber}`);
        }
        alert('Room capacity updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update room capacity:', error);
      alert('Failed to update room capacity');
    }
  };

  const groupRoomsByBuilding = () => {
    const grouped: any = {};
    rooms.forEach((room: any) => {
      if (!grouped[room.bNo]) {
        grouped[room.bNo] = [];
      }
      grouped[room.bNo].push(room);
    });
    return grouped;
  };

  const handleRoomClick = (room: any) => {
    setSelectedRoom(room);
    setShowTagBox(true);
  };

  const filterRooms = (roomsList: any[]) => {
    if (!searchQuery.trim()) return roomsList;
    
    return roomsList.filter((room: any) => {
      const searchTerm = searchQuery.toLowerCase().trim();
      const roomIdentifier = `${room.bNo}-${room.rNo}`.toLowerCase();
      const buildingNumber = room.bNo.toString().toLowerCase();
      const roomNumber = room.rNo.toLowerCase();
      
      return roomIdentifier.includes(searchTerm) || 
             buildingNumber.includes(searchTerm) || 
             roomNumber.includes(searchTerm);
    });
  };

  const handleTagSelect = async (roomType: string) => {
    if (selectedRoom) {
      try {
        // Immediately update UI
        setRooms(prev => prev.map((room: any) => 
          room.rNo === selectedRoom.rNo && room.bNo === selectedRoom.bNo 
            ? { ...room, rType: roomType } 
            : room
        ));
        
        // Update selected room for modal display
        setSelectedRoom(prev => prev ? { ...prev, rType: roomType } : null);
        
        // Sync to database in background
        const response = await fetch(`http://localhost:3001/api/rooms/${selectedRoom.rNo}/${selectedRoom.bNo}/type`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ roomType })
        });
        
        if (response.ok) {
          console.log(`✅ Room ${selectedRoom.rNo}-${selectedRoom.bNo} tagged as ${roomType}`);
        } else {
          console.error('❌ Failed to sync room type to database');
          // Revert UI change if database sync failed
          setRooms(prev => prev.map((room: any) => 
            room.rNo === selectedRoom.rNo && room.bNo === selectedRoom.bNo 
              ? { ...room, rType: selectedRoom.rType } 
              : room
          ));
        }
      } catch (error) {
        console.error('❌ Error updating room type:', error);
      }
    }
  };

  const fetchMaintenanceStats = async (force = false) => {
    if (!isAuthorized) return;
    
    // Debounce: prevent requests within 2 seconds
    const now = Date.now();
    const lastFetch = lastFetchTime.maintenance || 0;
    if (!force && now - lastFetch < 2000) return;
    
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/rooms', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const totalRooms = data.length;
        const maintenanceRooms = data.filter((room: any) => room.rStatus === 'Maintenance').length;
        setMaintenanceStats({ 
          totalRooms, 
          maintenanceRooms, 
          lastUpdated: new Date().toLocaleString() 
        });
        setLastFetchTime(prev => ({ ...prev, maintenance: now }));
      } else {
        setError('Failed to load maintenance data.');
      }
    } catch (error) {
      console.error('Failed to fetch maintenance stats:', error);
      setError('Network error. Please try again.');
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  const cleanupOldLogs = async () => {
    if (!isAuthorized) return;
    try {
      const response = await fetch('http://localhost:3001/api/analytics/cleanup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      } else {
        setError('Failed to cleanup logs.');
      }
    } catch (error) {
      console.error('Failed to cleanup logs:', error);
      setError('Network error during cleanup.');
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;
    if (activeTab === 'security') {
      fetchFailedLogins();
    } else if (activeTab === 'sessions') {
      fetchActiveSessions();
    } else if (activeTab === 'maintenance') {
      fetchMaintenanceStats();
    } else if (activeTab === 'roomTypes' || activeTab === 'roomStatus' || activeTab === 'roomCapacity') {
      fetchRooms();
    }
  }, [activeTab, isAuthorized]);

  // Load initial data on component mount
  useEffect(() => {
    if (isAuthorized) {
      // Load all data immediately on mount
      fetchRooms(true);
      fetchFailedLogins(true);
      fetchActiveSessions(true);
      fetchMaintenanceStats(true);
    }
  }, [isAuthorized]);

  // Show access denied if not authorized
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white z-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHI+PIKdlbCJ3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-30"></div>
        <div className="relative z-10 flex h-full">
          <SharedSidebar
            title="Admin Dashboard"
            activeSection="admin"
            onClose={onClose}
            onHome={onHome}
            onAccount={onAccount}
            onSettings={onSettings}
            onAdmin={() => {}}
            onLogout={onLogout}
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
              <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-red-300 mb-6">Only users with admin role can access this dashboard.</p>
              <button
                onClick={onClose}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-xl transition-all border border-red-500/30"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHI+PIKdlbCJ3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative z-10 flex h-full">
        {/* Sidebar Navigation */}
        <SharedSidebar
          title="Admin Dashboard"
          activeSection="admin"
          onClose={onClose}
          onHome={onHome}
          onAccount={onAccount}
          onSettings={onSettings}
          onAdmin={() => {}}
          onLogout={onLogout}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'security' 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Security Monitor
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'sessions' 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Active Sessions
            </button>
            <button
              onClick={() => setActiveTab('roomTypes')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'roomTypes' 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Room Types
            </button>
            <button
              onClick={() => setActiveTab('roomStatus')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'roomStatus' 
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Room Status
            </button>
            <button
              onClick={() => setActiveTab('roomCapacity')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'roomCapacity' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Room Capacity
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'maintenance' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Maintenance
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
          </div>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-4"></div>
                <div className="text-white/60">Loading data...</div>
              </div>
            )}

            {/* Security Monitor Tab */}
            {activeTab === 'security' && !loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-white">Failed Login Attempts (Last 24 Hours)</h2>
                  <button
                    onClick={() => fetchFailedLogins(true)}
                    disabled={isRefreshing}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-colors border border-red-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </div>
                {failedLogins.length === 0 ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                    <div className="text-green-300 font-medium mb-2">✅ All Clear</div>
                    <div className="text-white/60 text-sm">No failed login attempts in the last 24 hours</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {failedLogins.map((log: any) => (
                      <div key={log.id} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-red-300 font-medium">{log.email || 'Unknown'}</div>
                            <div className="text-white/60 text-sm">IP: {log.ipAddress || 'N/A'}</div>
                            <div className="text-white/60 text-sm">Details: {log.details || 'Failed login attempt'}</div>
                          </div>
                          <div className="text-white/40 text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Sessions Tab */}
            {activeTab === 'sessions' && !loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-white">Active Sessions (Last 24 Hours)</h2>
                  <button
                    onClick={() => fetchActiveSessions(true)}
                    disabled={isRefreshing}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-xl transition-colors border border-blue-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </div>
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No active sessions found</div>
                ) : (
                  <div className="grid gap-4">
                    {activeSessions.map((session: any, index) => (
                      <div key={index} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-blue-300 font-medium">{session.email || 'Unknown User'}</div>
                            <div className="text-white/60 text-sm">Faculty ID: {session.facultyId || 'N/A'}</div>
                            <div className="text-white/40 text-xs">User ID: {session.userId || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white/60 text-sm font-medium">
                              {session._count?.action || 0} login(s)
                            </div>
                            <div className="text-white/40 text-xs">Last 24h</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Room Types Tab */}
            {activeTab === 'roomTypes' && !loading && (
              <div className="space-y-6">
                <h2 className="text-xl font-medium text-white mb-6">Room Type Management</h2>
                <p className="text-white/60 text-sm mb-4">Click on any room to assign a type tag</p>
                {rooms.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No rooms found</div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupRoomsByBuilding()).map(([buildingNumber, buildingRooms]: [string, any]) => {
                      const filteredBuildingRooms = filterRooms(buildingRooms);
                      if (filteredBuildingRooms.length === 0) return null;
                      
                      return (
                        <div key={buildingNumber} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                          <h3 className="text-white font-medium text-lg mb-4">Building {buildingNumber}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {filteredBuildingRooms.map((room: any) => (
                              <div
                                key={`${room.rNo}-${room.bNo}`}
                                onClick={() => handleRoomClick(room)}
                                className={`group relative bg-white/10 hover:bg-white/20 border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                  room.rType === 'Undefined' 
                                    ? 'border-red-500/50 hover:border-red-400/70' 
                                    : 'border-green-500/50 hover:border-green-400/70'
                                }`}
                              >
                                <div className="text-white font-semibold text-sm mb-2">Room {room.rNo}</div>
                                <div className={`text-xs font-medium mb-1 ${
                                  room.rType === 'Undefined' ? 'text-red-300' : 'text-green-300'
                                }`}>
                                  {room.rType}
                                </div>
                                <div className="text-white/50 text-xs">Cap: {room.capacity}</div>
                                
                                {/* Status indicator */}
                                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                                  room.rType === 'Undefined' ? 'bg-red-400' : 'bg-green-400'
                                }`}></div>
                                
                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:to-blue-500/10 rounded-xl transition-all duration-300"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Room Status Tab */}
            {activeTab === 'roomStatus' && !loading && (
              <div className="space-y-4">
                <h2 className="text-xl font-medium text-white mb-6">Room Status Management</h2>
                {rooms.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No rooms found</div>
                ) : (
                  <div className="grid gap-4">
                    {filterRooms(rooms).map((room: any) => (
                      <div key={`${room.rNo}-${room.bNo}`} className="bg-white/10 border border-white/20 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-medium">Room {room.rNo} - Building {room.bNo}</div>
                            <div className="text-white/60 text-sm">{room.rType}</div>
                            <div className={`text-xs mt-1 font-medium ${
                              room.rStatus === 'Available' ? 'text-green-400' :
                              room.rStatus === 'Booked' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              Status: {room.rStatus}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={room.rStatus}
                              onChange={(e) => updateRoomStatus(room.rNo, room.bNo.toString(), e.target.value)}
                              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            >
                              {roomStatuses.map(status => (
                                <option key={status} value={status} className="bg-black/80 backdrop-blur-md text-white border-none">{status}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Room Capacity Tab */}
            {activeTab === 'roomCapacity' && !loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-medium text-white">Room Capacity Management</h2>
                    {isSearchActive && (
                      <p className="text-teal-300 text-sm mt-1">Showing search results for: "{searchQuery}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        id="capacity-search"
                        placeholder="Search rooms (e.g., 1-101, Building 1, Room 101)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-800/80 backdrop-blur-md text-white placeholder-white/50 border-2 border-white/30 rounded-xl pl-10 pr-4 py-3 text-sm font-medium shadow-lg hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-300 w-80"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (searchQuery.trim()) {
                          setIsSearchActive(true);
                        } else {
                          const searchInput = document.querySelector('#capacity-search') as HTMLInputElement;
                          if (searchInput) searchInput.focus();
                        }
                      }}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-3 rounded-xl text-sm transition-all border border-blue-500/30 font-medium"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchActive(false);
                      }}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm transition-all border border-red-500/30 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                {rooms.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No rooms found</div>
                ) : (
                  <div className="grid gap-4">
                    {(() => {
                      const displayRooms = isSearchActive ? filterRooms(rooms) : rooms;
                      if (isSearchActive && displayRooms.length === 0) {
                        return <div className="text-center py-8 text-white/60">No rooms match your search</div>;
                      }
                      return displayRooms.map((room: any) => (
                      <div key={`${room.rNo}-${room.bNo}`} className="bg-white/10 border border-white/20 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-medium">Room {room.rNo} - Building {room.bNo}</div>
                            <div className="text-white/60 text-sm">{room.rType}</div>
                            <div className="text-teal-400 text-xs mt-1 font-medium">
                              Current Capacity: {room.capacity} students
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="500"
                              defaultValue={room.capacity}
                              id={`capacity-${room.rNo}-${room.bNo}`}
                              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                              placeholder="0"
                            />
                            <span className="text-white/60 text-sm">students</span>
                            <button
                              onClick={() => {
                                const input = document.getElementById(`capacity-${room.rNo}-${room.bNo}`) as HTMLInputElement;
                                if (input && input.value !== room.capacity.toString()) {
                                  updateRoomCapacity(room.rNo, room.bNo.toString(), input.value);
                                }
                              }}
                              className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 px-3 py-2 rounded-lg text-sm transition-all border border-teal-500/30 font-medium"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && !loading && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-white">System Maintenance</h2>
                  <button
                    onClick={() => fetchMaintenanceStats(true)}
                    disabled={isRefreshing}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-xl transition-colors border border-blue-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </div>
                
                {/* Maintenance Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="text-green-300 font-medium text-lg">{maintenanceStats.totalRooms}</div>
                    <div className="text-white/60 text-sm">Total Rooms</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="text-orange-300 font-medium text-lg">{maintenanceStats.maintenanceRooms}</div>
                    <div className="text-white/60 text-sm">Under Maintenance</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="text-blue-300 font-medium text-lg">{maintenanceStats.totalRooms - maintenanceStats.maintenanceRooms}</div>
                    <div className="text-white/60 text-sm">Operational Rooms</div>
                  </div>
                </div>
                
                {maintenanceStats.lastUpdated && (
                  <div className="text-white/40 text-sm mb-4">
                    Last updated: {maintenanceStats.lastUpdated}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-3">Data Cleanup</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Remove audit logs older than 1 year to free up database space.
                    </p>
                    <button
                      onClick={cleanupOldLogs}
                      className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-colors border border-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cleanup Old Logs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tag Selection Box */}
      {showTagBox && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex: 9999}}>
          <div className="bg-white rounded-lg p-6 shadow-2xl w-96" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <h3 className="text-gray-800 text-lg font-bold">Set Room Type</h3>
              <p className="text-gray-600 text-sm">Room {selectedRoom.rNo} - Building {selectedRoom.bNo}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {roomTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTagSelect(type);
                    setShowTagBox(false);
                    setSelectedRoom(null);
                  }}
                  className={`p-3 rounded-lg text-sm font-semibold border-2 cursor-pointer ${
                    selectedRoom.rType === type
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTagBox(false);
                  setSelectedRoom(null);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};