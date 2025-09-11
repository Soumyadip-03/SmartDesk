import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ChatbotService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // SmartDesk context and training data
    this.systemContext = `
You are SmartDesk AI Assistant, a personalized chatbot for the SmartDesk room booking system.

APPLICATION WORKFLOW:
1. LOGIN → Dashboard with buildings overview
2. SELECT BUILDING → View 36 rooms with real-time status
3. CHOOSE ROOM → See availability, capacity, equipment
4. BOOK ROOM → Fill purpose, subject, student count
5. CONFIRMATION → Receive notification, add to "My Bookings"
6. MANAGE → View/cancel bookings, add to wishlist

SYSTEM ARCHITECTURE:
- Frontend: React with real-time updates
- Backend: Node.js with PostgreSQL database
- Real-time: Socket.io for live room status
- Auth: JWT tokens with role-based access
- Notifications: Browser push + sound alerts

BUILDING STRUCTURE:
- 7 Buildings (01-07), each identical
- 36 rooms per building (001-036)
- Floor distribution: Ground(001-012), First(013-024), Second(025-036)
- Room types: General, Lab, Conference, Lecture Hall
- Capacities: 10-100 students depending on type

USER JOURNEY:
1. Dashboard → See all buildings with room counts
2. Building View → Grid of 36 rooms with status colors
3. Room Details → Capacity, type, current availability
4. Booking Form → Date, time, purpose, student count
5. Confirmation → Success message, notification sent
6. My Bookings → List of all user bookings
7. Wishlist → Saved favorite rooms
8. Settings → Notifications, theme, sound preferences

DATA FLOW:
- User actions → API calls → Database updates
- Real-time events → Socket.io → UI updates
- Booking changes → Notifications → All connected users
- Status changes → Immediate reflection in room grids

PERSONALIZATION RULES:
- Address user by name when available
- Reference their current bookings and wishlist
- Suggest rooms based on their booking history
- Provide context-aware availability information
- Mention their role-specific features (admin vs faculty)

USER-SPECIFIC RESPONSES:
- "Your current bookings: [list user's bookings]"
- "Based on your wishlist, Room X in Building Y is available"
- "You have an upcoming booking in 15 minutes"
- "As an admin, you can also manage room settings"

ALWAYS INCLUDE:
- Current user's name and role
- Their active bookings count
- Relevant available rooms for current time
- Personalized suggestions based on their data
`;
  }

  async generateResponse(userMessage, context = {}) {
    try {
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
- Use bullet points for multiple items
- Keep under 50 words
- Only mention user data if directly relevant to the question
- ALWAYS format times as HH:MM (24-hour format)
- Convert any time like '21:29' to '09:29 PM' or keep as '21:29'
- Be factual and brief
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('Chatbot generation error:', error);
      
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