import { useState } from 'react';
import { apiService } from '../services/api';

export const IntegrationTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Get buildings
      addResult('Testing buildings endpoint...');
      const buildings = await apiService.getBuildings();
      addResult(`✓ Buildings: ${buildings.length} found`);

      // Test 2: Get rooms for first building
      if (buildings.length > 0) {
        addResult('Testing rooms endpoint...');
        const rooms = await apiService.getBuildingRooms(buildings[0].buildingNumber);
        addResult(`✓ Rooms: ${rooms.length} found for building ${buildings[0].buildingNumber}`);
      }

      // Test 3: Get notifications
      addResult('Testing notifications endpoint...');
      const notifications = await apiService.getNotifications();
      addResult(`✓ Notifications: ${notifications.length} found`);

      // Test 4: Get unread count
      addResult('Testing unread count endpoint...');
      const unreadCount = await apiService.getUnreadNotificationCount();
      addResult(`✓ Unread count: ${unreadCount.count}`);

      // Test 5: Get bookings
      addResult('Testing bookings endpoint...');
      const bookings = await apiService.getBookings();
      addResult(`✓ Bookings: ${bookings.length} found`);

      // Test 6: Get wishlist
      addResult('Testing wishlist endpoint...');
      const wishlist = await apiService.getWishlist();
      addResult(`✓ Wishlist: ${wishlist.length} items found`);

      addResult('🎉 All tests passed!');
    } catch (error: any) {
      addResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Frontend-Backend Integration Test</h2>
        
        <button
          onClick={runTests}
          disabled={isRunning}
          className="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
        </button>

        <div className="bg-black/50 rounded-lg p-4 h-96 overflow-y-auto">
          <div className="font-mono text-sm text-green-300 space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className={result.includes('❌') ? 'text-red-300' : result.includes('✓') ? 'text-green-300' : result.includes('🎉') ? 'text-yellow-300' : 'text-white'}>
                {result}
              </div>
            ))}
            {testResults.length === 0 && (
              <div className="text-gray-400">Click "Run Integration Tests" to start testing...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};