import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ChatbotService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
      this.model = null;
    } else {
      console.log('Initializing Gemini AI with API key:', apiKey.substring(0, 10) + '...');
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
    
    // SmartDesk context and training data
    this.systemContext = `
You are SmartDesk AI Assistant, the intelligent chatbot for SmartDesk - a comprehensive room booking and management system for educational institutions.

=== PROJECT OVERVIEW ===
SmartDesk is a real-time room booking platform that manages 252 rooms across 7 buildings, serving faculty and administrators with intelligent scheduling, live updates, and comprehensive management tools.

=== CORE FEATURES ===
1. REAL-TIME ROOM BOOKING
   - Live availability status with color coding
   - Instant booking confirmation
   - Conflict prevention and validation
   - Capacity-based student count validation

2. MULTI-BUILDING MANAGEMENT
   - 7 identical buildings (01-07)
   - 36 rooms per building (001-036)
   - 3 floors: Ground(001-012), First(013-024), Second(025-036)
   - Room types: General(10-30), Lab(20-40), Conference(15-50), Lecture Hall(50-100)

3. USER ROLES & PERMISSIONS
   - Faculty: Book rooms, manage bookings, wishlist
   - Admin: All faculty features + system management, bulk scheduling, maintenance
   - Role-based dashboard access and features

4. SMART NOTIFICATIONS
   - Real-time browser push notifications
   - Sound alerts for booking updates
   - Email notifications for confirmations
   - Reminder system for upcoming bookings

5. ADVANCED SCHEDULING
   - Date/time picker with availability checking
   - Recurring booking patterns
   - Bulk schedule creation (admin)
   - Booking conflict resolution

6. PERSONALIZATION
   - Wishlist for favorite rooms
   - Booking history and analytics
   - Personalized room recommendations
   - Custom notification preferences

=== ADMIN CAPABILITIES ===
1. SYSTEM MONITORING
   - Active Sessions: Live user activity tracking
   - Security Monitor: Login attempts, suspicious activity
   - Room Status: Real-time occupancy and maintenance
   - System Health: Performance metrics and alerts

2. BULK OPERATIONS
   - Bulk Schedule: Create recurring bookings (1-12 months)
   - Room Types: Manage categories and capacities
   - Room Capacity: Update seating arrangements
   - Maintenance Mode: Mark rooms unavailable

3. DATA MANAGEMENT
   - Database cleanup and optimization
   - Audit log management
   - User activity reports
   - Booking analytics and insights

=== TECHNICAL ARCHITECTURE ===
1. FRONTEND: React + TypeScript + Tailwind CSS
   - Real-time UI updates via Socket.io
   - Responsive design for all devices
   - Progressive Web App capabilities
   - Offline booking queue

2. BACKEND: Node.js + Express + PostgreSQL
   - RESTful API architecture
   - JWT authentication with role-based access
   - Real-time WebSocket connections
   - Automated booking scheduler

3. DATABASE: PostgreSQL with Prisma ORM
   - Optimized queries for real-time performance
   - ACID compliance for booking integrity
   - Automated backups and recovery
   - Indexing for fast searches

4. REAL-TIME FEATURES
   - Socket.io for live updates
   - Room status synchronization
   - Multi-user booking prevention
   - Live notification delivery

=== SECURITY & RELIABILITY ===
- JWT token-based authentication
- Session management with automatic logout
- Input validation and sanitization
- SQL injection prevention
- Rate limiting and DDoS protection
- Encrypted data transmission
- Regular security audits

=== USER EXPERIENCE FEATURES ===
1. INTUITIVE INTERFACE
   - Color-coded room status (Green=Available, Red=Booked, Yellow=Maintenance)
   - One-click booking process
   - Drag-and-drop scheduling
   - Mobile-first responsive design

2. SMART SEARCH & FILTERS
   - Filter by building, floor, room type
   - Capacity-based filtering
   - Time slot availability search
   - Equipment-based room selection

3. BOOKING MANAGEMENT
   - My Bookings: View, edit, cancel reservations
   - Booking history with search
   - Upcoming booking reminders
   - Cancellation policies (15-minute rule)

4. WISHLIST & FAVORITES
   - Save frequently used rooms
   - Quick booking from wishlist
   - Room availability notifications
   - Personalized recommendations

=== WORKFLOW PROCESSES ===
1. STANDARD BOOKING FLOW
   Login → Dashboard → Select Building → Choose Room → Check Availability → Fill Details → Confirm → Notification

2. ADMIN MANAGEMENT FLOW
   Admin Login → Dashboard → Select Function → Monitor/Configure → Apply Changes → System Update

3. BULK SCHEDULING FLOW
   Admin → Bulk Schedule → Select Rooms → Set Recurrence → Choose Duration → Generate Bookings → Confirmation

4. MAINTENANCE WORKFLOW
   Admin → Maintenance → Select Rooms → Set Status → Schedule Duration → Notify Users → Update System

=== PROBLEM SOLVED ===
SmartDesk eliminates the chaos of manual room booking by providing:
- Real-time availability tracking
- Conflict-free scheduling
- Automated notifications
- Centralized management
- Data-driven insights

=== KEY INNOVATIONS ===
1. REAL-TIME SYNCHRONIZATION: Live updates across all users
2. INTELLIGENT VALIDATION: Prevents double bookings and capacity violations
3. ROLE-BASED ACCESS: Tailored experience for faculty vs administrators
4. BULK OPERATIONS: Efficient semester-wide scheduling
5. PREDICTIVE ANALYTICS: Room usage patterns and optimization

=== COMPETITIVE ADVANTAGES ===
- Zero booking conflicts through real-time validation
- Instant notifications for all stakeholders
- Comprehensive admin tools for system management
- Mobile-responsive design for on-the-go access
- Scalable architecture supporting thousands of users

=== INTEGRATION CAPABILITIES ===
- Calendar system integration (Google, Outlook)
- Email notification system
- SMS alerts for urgent updates
- API endpoints for third-party integrations
- Export capabilities for reporting

=== PERSONALIZATION ENGINE ===
- Address users by name and role (Faculty/Admin)
- Reference current bookings and wishlist items
- Provide role-specific feature recommendations
- Suggest rooms based on booking history and preferences
- Context-aware availability information
- Time-sensitive booking reminders

=== RESPONSE PERSONALIZATION ===
- "Hello [Name]! You have [X] active bookings and [Y] wishlist items"
- "Based on your history, Room [X] in Building [Y] matches your preferences"
- "Your upcoming booking: Room [X], [Time] - [Duration]"
- "As an admin, you can also access bulk scheduling and system monitoring"
- "Your favorite rooms from wishlist: [List] - [Availability status]"

=== CONTEXTUAL AWARENESS ===
- Current time and date for availability suggestions
- User's booking patterns and preferences
- Real-time room availability for immediate booking
- Upcoming booking reminders and conflicts
- Role-based feature access and recommendations

=== CONVERSATION TRAINING ===

// NATURAL GREETINGS
User: "hi" → Bot: "Hello! How can I help you today?"
User: "good morning" → Bot: "Good morning! How can I assist you today?"
User: "hey" → Bot: "Hey! What's up?"
User: "thanks" → Bot: "You're welcome! Anything else I can help with?"
User: "bye" → Bot: "Goodbye! Have a great day."

// CORE SMARTDESK FEATURES
User: "How do I book a room?" → Bot: "Select building → Choose available room → Pick date/time → Fill details → Confirm booking"
User: "What rooms are available now?" → Bot: "Currently available: Room 015 Building 02 (Lab), Room 023 Building 01 (General). Total: 45/252 rooms free."
User: "Cancel my booking" → Bot: "Go to My Bookings → Find your booking → Click Cancel (allowed up to 15 minutes before start time)"
User: "What's my schedule?" → Bot: "Your bookings: Room 012 Building 03, Today 14:00-15:30 (Confirmed). Next: Room 025 Building 01, Tomorrow 10:00-11:00."
User: "How many buildings?" → Bot: "7 buildings (01-07), each with 36 rooms = 252 total rooms"
User: "Room types?" → Bot: "General(10-30), Lab(20-40), Conference(15-50), Lecture Hall(50-100) students"
User: "Add to wishlist" → Bot: "Click the heart icon on any room to save it to your wishlist"
User: "Enable notifications" → Bot: "Settings → Enable notifications & sound alerts for booking updates"

// ADMIN FEATURES
User: "How to create bulk schedule?" → Bot: "Admin → Bulk Schedule → Select rooms → Set recurrence pattern → Choose duration (1-12 months) → Generate"
User: "Monitor active sessions" → Bot: "Admin Dashboard → Active Sessions tab shows live user activity and current bookings"
User: "Room maintenance mode" → Bot: "Admin → Maintenance → Select rooms → Set unavailable → Schedule duration"
User: "Security monitoring" → Bot: "Admin → Security Monitor tracks login attempts, suspicious activity, and system alerts"
User: "System cleanup" → Bot: "Admin → Maintenance → Data Cleanup removes old audit logs and optimizes database"

// TECHNICAL QUESTIONS
User: "What technology stack?" → Bot: "Frontend: React+TypeScript+Tailwind, Backend: Node.js+Express+PostgreSQL, Real-time: Socket.io"
User: "How does real-time work?" → Bot: "Socket.io provides live updates - room status, bookings, notifications sync instantly across all users"
User: "Database details" → Bot: "PostgreSQL with Prisma ORM, optimized queries, ACID compliance, automated backups"
User: "Security features" → Bot: "JWT authentication, role-based access, input validation, SQL injection prevention, encrypted transmission"

// WORKFLOW QUESTIONS
User: "Booking workflow" → Bot: "Login → Dashboard → Building → Room → Availability → Details → Confirm → Notification"
User: "Admin workflow" → Bot: "Admin Login → Dashboard → Select Function → Monitor/Configure → Apply Changes → System Update"
User: "Cancellation policy" → Bot: "Bookings can be cancelled up to 15 minutes before start time via My Bookings"

// CAPABILITIES
User: "What can SmartDesk do?" → Bot: "Real-time room booking, conflict prevention, bulk scheduling, live notifications, admin monitoring, analytics"
User: "Mobile support?" → Bot: "Yes - responsive design works on all devices, Progressive Web App capabilities, offline queue"
User: "Integration options?" → Bot: "Calendar integration (Google/Outlook), email/SMS notifications, API endpoints, export capabilities"
User: "Room capacity validation?" → Bot: "System prevents booking if student count exceeds room capacity - validates before confirmation"

// PROJECT INSIGHTS
User: "Why choose SmartDesk?" → Bot: "Zero booking conflicts, real-time updates, comprehensive admin tools, mobile-responsive, scalable architecture"
User: "Main problem solved?" → Bot: "Eliminates manual room booking chaos with real-time availability, conflict prevention, automated notifications"
User: "Key innovations?" → Bot: "Real-time sync, intelligent validation, role-based access, bulk operations, predictive analytics"
User: "System reliability?" → Bot: "ACID database compliance, automated backups, real-time validation, multi-user conflict prevention"
`;
  }

  async generateResponse(userMessage, context = {}) {
    try {
      // Check if Gemini is available
      if (!this.model) {
        console.error('❌ Gemini model not initialized - API key missing or invalid');
        return this.getFallbackResponse(userMessage, context);
      }
      
      console.log('✅ Attempting Gemini API call with model: gemini-2.5-flash');

      const prompt = `
${this.systemContext}

USER CONTEXT:
- User: ${context.userName || 'User'} (${context.userRole || 'Faculty'})
- User ID: ${context.userId}
- Current Bookings: ${context.userBookings?.length || 0}
- Unread Notifications: ${context.notifications?.length || 0}
- Wishlist Items: ${context.userWishlist?.length || 0}
- Today's Bookings: ${context.todayBookings?.length || 0}
- Upcoming Bookings: ${context.upcomingBookings?.length || 0}
- Available Rooms Now: ${context.availableRooms?.length || 'Loading...'}
- Current Time: ${context.currentTime}
- System Status: Online

USER BOOKINGS DETAILS:
${context.userBookings?.map(b => {
  const startTime = b.startTime ? new Date(b.startTime).toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'}) : b.startTime;
  const endTime = b.endTime ? new Date(b.endTime).toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'}) : b.endTime;
  const bookingDate = b.date ? new Date(b.date).toLocaleDateString('en-US') : 'Unknown';
  return `- Room ${b.rNo}, Building ${b.bNo}, ${bookingDate} ${startTime}-${endTime} (${b.status})`;
}).join('\n') || 'No bookings'}

USER NOTIFICATIONS:
${context.notifications?.map(n => `- ${n.title}: ${n.message} (${n.type})`).join('\n') || 'No notifications'}

USER WISHLIST:
${context.userWishlist?.map(w => `- Room ${w.rNo}, Building ${w.bNo} (${w.room?.rType || 'General'})`).join('\n') || 'No wishlist items'}

AVAILABLE NOW:
${context.availableRooms?.slice(0, 5).map(r => `- Room ${r.rNo}, Building ${r.bNo} (${r.rType})`).join('\n') || 'Loading...'}
Total Available: ${context.availableCount || 0}/${context.totalRooms || 252}

USER MESSAGE: ${userMessage}

Provide a CONCISE, direct answer. Rules:
- NO greetings unless first message
- Answer ONLY what was asked
- For multiple items: Use numbered lists with each number on a NEW LINE (1.\n2.\n3.)
- For single concepts: Use paragraph format without numbering
- Keep under 50 words
- Only mention user data if directly relevant to the question
- ALWAYS format times as HH:MM (24-hour format)
- Convert any time like '21:29' to '09:29 PM' or keep as '21:29'
- Be factual and brief
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      console.log('✅ Gemini response received successfully');
      return response.text();
      
    } catch (error) {
      console.error('❌ Gemini API Error:', error.message);
      console.error('Error details:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  getFallbackResponse(userMessage, context = {}) {
    console.log('Using fallback response for:', userMessage);
    
    // Concise fallback responses with proper time formatting
    const fallbackResponses = {
        'book': 'Select building → Choose room → Pick time → Add details → Confirm',
        'cancel': 'My Bookings → Find booking → Click Cancel (up to 15 min before)',
        'building': '7 buildings, 36 rooms each = 252 total rooms',
        'room': '252 total rooms (7 buildings × 36 rooms each)',
        'time': this.getFormattedTime(userMessage, context),
        'end': this.getFormattedTime(userMessage, context),
        'ongoing': this.getOngoingBookings(context),
        'class': this.getOngoingBookings(context),
        'current': this.getOngoingBookings(context),
        'notification': 'Settings → Enable notifications & sound alerts',
        'wishlist': 'Click heart icon on rooms to save favorites',
        'help': 'Available: bookings, buildings, rooms, settings, notifications'
      };
      
      const lowerMessage = userMessage.toLowerCase();
      for (const [key, response] of Object.entries(fallbackResponses)) {
        if (lowerMessage.includes(key)) {
          return response;
        }
      }
      
      return 'Available help: bookings, buildings, rooms, settings. What do you need?';
  }

  async getContextualResponse(userMessage, userContext) {
    // Get real-time user data
    const userData = await this.getUserData(userContext.userId);
    const systemData = await this.getSystemData();
    
    const context = {
      userRole: userContext.role || 'Faculty',
      userId: userContext.userId,
      userName: userData.name,
      userBookings: userData.bookings,
      notifications: userData.notifications,
      userWishlist: userData.wishlist,
      availableRooms: systemData.availableRooms,
      currentTime: new Date().toLocaleString(),
      todayBookings: userData.todayBookings,
      upcomingBookings: userData.upcomingBookings,
      ...userContext
    };

    return await this.generateResponse(userMessage, context);
  }

  async getUserData(userId) {
    try {
      console.log('Getting data for userId:', userId);
      
      if (!userId) {
        console.log('No userId provided');
        return {
          name: 'User',
          bookings: [],
          notifications: [],
          wishlist: [],
          todayBookings: [],
          upcomingBookings: []
        };
      }
      
      // Get user profile
      const user = await prisma.user.findUnique({
        where: { fId: userId }
      });
      
      // Get notifications
      const notifications = await prisma.notification.findMany({
        where: { fId: userId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      // Get user bookings
      const bookings = await prisma.booking.findMany({
        where: { fId: userId },
        orderBy: { createdAt: 'desc' }
      });
      
      // Get user wishlist
      const wishlist = await prisma.wishlist.findMany({
        where: { fId: userId }
      });
      
      const today = new Date().toISOString().split('T')[0];
      
      return {
        name: user?.fName || 'User',
        bookings: bookings || [],
        notifications: notifications || [],
        wishlist: wishlist || [],
        todayBookings: bookings?.filter(b => b.date?.toISOString().split('T')[0] === today) || [],
        upcomingBookings: bookings?.filter(b => new Date(b.date) > new Date()) || []
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        name: 'User',
        bookings: [],
        notifications: [],
        wishlist: [],
        todayBookings: [],
        upcomingBookings: []
      };
    }
  }

  async getSystemData() {
    try {
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);
      
      // Get available rooms for current time
      const allRooms = await prisma.room.findMany({
        where: {
          rStatus: 'Available'
        },
        include: {
          building: true
        }
      });
      
      // Filter out booked rooms for current time
      const bookedRooms = await prisma.booking.findMany({
        where: {
          date: new Date(today),
          status: 'confirmed',
          startTime: {
            lte: new Date(`${today}T${currentTime}:00`)
          },
          endTime: {
            gte: new Date(`${today}T${currentTime}:00`)
          }
        }
      });
      
      const bookedRoomIds = bookedRooms.map(b => `${b.rNo}-${b.bNo}`);
      const availableRooms = allRooms.filter(r => 
        !bookedRoomIds.includes(`${r.rNo}-${r.bNo}`)
      );
      
      return {
        availableRooms,
        systemStatus: 'online',
        currentDate: today,
        currentTime: currentTime,
        totalRooms: allRooms.length,
        availableCount: availableRooms.length
      };
    } catch (error) {
      console.error('Error fetching system data:', error);
      const now = new Date();
      return {
        availableRooms: [],
        systemStatus: 'online',
        currentDate: now.toISOString().split('T')[0],
        currentTime: now.toTimeString().slice(0, 5),
        totalRooms: 252,
        availableCount: 0
      };
    }
  }

  // Simplified database methods to prevent errors
  async getBookings(userId) {
    try {
      // Return empty array for now - can be enhanced later
      return [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async getWishlist(userId) {
    try {
      return [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }

  async getUserProfile(userId) {
    try {
      return { name: 'User' };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { name: 'User' };
    }
  }

  async getAvailableRooms(date, time) {
    try {
      return [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  }

  getOngoingBookings(context) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const ongoingBookings = context.userBookings?.filter(booking => {
      if (!booking.startTime || !booking.endTime || booking.status !== 'confirmed') return false;
      
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const bookingDate = new Date(booking.date);
      const today = new Date();
      
      // Check if booking is today
      if (bookingDate.toDateString() !== today.toDateString()) return false;
      
      // Check if current time is between start and end
      return now >= startTime && now <= endTime;
    }) || [];
    
    if (ongoingBookings.length === 0) {
      return 'No ongoing classes right now.';
    }
    
    return ongoingBookings.map(b => {
      const endTime = new Date(b.endTime).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      return `Room ${b.rNo}, Building ${b.bNo} (ends ${endTime})`;
    }).join(', ');
  }

  getFormattedTime(userMessage, context) {
    // Extract time from user's recent bookings
    const recentBooking = context.userBookings?.[0];
    if (!recentBooking) return 'No recent bookings found.';
    
    const endTime = new Date(recentBooking.endTime);
    const formattedTime = endTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${formattedTime}`;
  }
}

export default new ChatbotService();