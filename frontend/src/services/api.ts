const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private csrfToken: string | null = null;

  private getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (this.csrfToken) headers['X-CSRF-Token'] = this.csrfToken;
    return headers;
  }

  async getCSRFToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/csrf-token`);
      const data = await response.json();
      this.csrfToken = data.csrfToken;
      return this.csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token');
      return null;
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date) && !isNaN(Date.parse(date));
  }

  private validateTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  async request(endpoint: string, options: RequestInit = {}) {
    try {
      console.log('Making request to:', `${API_BASE_URL}${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });
      
      clearTimeout(timeoutId);

      console.log('Response status:', response.status);

      if (response.status === 401 || response.status === 403) {
        if (endpoint.includes('/auth/')) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          window.location.reload();
          return;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    console.log('Attempting login for:', email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, name: string, establishmentId: string, facultyId: string, password: string) {
    if (!email || !name || !establishmentId || !facultyId || !password) {
      throw new Error('All fields are required');
    }
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (establishmentId.trim().length < 2) {
      throw new Error('Establishment ID must be at least 2 characters');
    }
    if (facultyId.trim().length < 2) {
      throw new Error('Faculty ID must be at least 2 characters');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, establishmentId, facultyId, password }),
    });
  }

  // Buildings
  async getBuildings() {
    return this.request('/buildings');
  }

  async getBuilding(buildingNumber: string) {
    return this.request(`/buildings/${buildingNumber}`);
  }

  async getBuildingRooms(buildingNumber: string) {
    return this.request(`/buildings/${buildingNumber}/rooms`);
  }

  // Rooms
  async getRooms() {
    return this.request('/rooms');
  }

  async getRoomsByBuilding(buildingNumber: string) {
    return this.request(`/buildings/${buildingNumber}/rooms`);
  }

  async updateRoomType(roomNumber: string, buildingNumber: string, roomType: string) {
    return this.request(`/rooms/${roomNumber}/${buildingNumber}/type`, {
      method: 'PUT',
      body: JSON.stringify({ roomType }),
    });
  }

  async updateRoomStatus(roomNumber: string, buildingNumber: string, roomStatus: string) {
    return this.request(`/rooms/${roomNumber}/${buildingNumber}/status`, {
      method: 'PUT',
      body: JSON.stringify({ roomStatus }),
    });
  }

  async updateRoomCapacity(roomNumber: string, buildingNumber: string, capacity: number) {
    return this.request(`/rooms/${roomNumber}/${buildingNumber}/capacity`, {
      method: 'PUT',
      body: JSON.stringify({ capacity }),
    });
  }

  // Bookings
  async getBookings() {
    return this.request('/bookings');
  }

  async createBooking(bookingData: {
    roomNumber: string;
    buildingNumber: string;
    date: string;
    startTime: string;
    endTime: string;
    bookingType?: string;
    purpose?: string;
    notes?: string;
    courseSubject?: string;
    numberOfStudents?: string;
  }) {
    const { roomNumber, buildingNumber, date, startTime, endTime, bookingType = 'now', purpose = '', notes = '', courseSubject = '', numberOfStudents = '' } = bookingData;
    
    if (!roomNumber || !buildingNumber || !date || !startTime || !endTime) {
      throw new Error('All booking fields are required');
    }
    if (!this.validateDate(date)) {
      throw new Error('Invalid date format (YYYY-MM-DD required)');
    }
    if (!this.validateTime(startTime) || !this.validateTime(endTime)) {
      throw new Error('Invalid time format (HH:MM required)');
    }
    if (startTime >= endTime) {
      throw new Error('End time must be after start time');
    }
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ roomNumber, buildingNumber, date, startTime, endTime, bookingType, purpose, notes, courseSubject, numberOfStudents }),
    });
  }

  async cancelBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  }

  async deleteBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  }

  async swapBooking(bookingId: string, newRoomNumber: string, newBuildingNumber: string) {
    return this.request(`/bookings/${bookingId}/swap`, {
      method: 'POST',
      body: JSON.stringify({ newRoomNumber, newBuildingNumber }),
    });
  }

  async swapToRoom(swapData: {
    roomNumber: string;
    buildingNumber: string;
    courseSubject?: string;
    numberOfStudents?: string;
    purpose?: string;
    notes?: string;
    currentRoom: string;
  }) {
    return this.request('/bookings/swap', {
      method: 'POST',
      body: JSON.stringify(swapData),
    });
  }

  async getAvailableRooms(date: string, startTime: string, endTime: string, buildingNumber?: string) {
    const params = new URLSearchParams({ date, startTime, endTime });
    if (buildingNumber) params.append('buildingNumber', buildingNumber);
    return this.request(`/bookings/available?${params}`);
  }

  async getActiveBookings(buildingNumber: string, date: string) {
    const params = new URLSearchParams({ buildingNumber, date });
    return this.request(`/bookings/active?${params}`);
  }

  async getBuildingBookings(buildingNumber: string, date?: string) {
    const today = date || new Date().toISOString().split('T')[0];
    const params = new URLSearchParams({ date: today });
    return this.request(`/bookings/building/${buildingNumber}?${params}`);
  }

  // Wishlist
  async getWishlist() {
    return this.request('/wishlist');
  }

  async addToWishlist(roomNumber: string, buildingNumber: string) {
    if (!roomNumber || !buildingNumber) {
      throw new Error('Room number and building number are required');
    }
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ roomNumber, buildingNumber }),
    });
  }

  async removeFromWishlist(roomNumber: string, buildingNumber: string) {
    return this.request(`/wishlist/${roomNumber}/${buildingNumber}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async clearAllNotifications() {
    return this.request('/notifications/clear-all', {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();