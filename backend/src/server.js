import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/auth.js';
import buildingRoutes from './routes/buildings.js';
import bookingRoutes from './routes/bookings.js';
import wishlistRoutes from './routes/wishlist.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import roomRoutes from './routes/rooms.js';
import chatbotRoutes from './routes/chatbot.js';
import healthRoutes from './routes/health.js';
import dashboardRoutes from './routes/dashboard.js';
import { authenticateToken } from './middleware/auth.js';
import { sanitizeForLog } from './utils/sanitize.js';
import { initializeSocket } from './socket/socketHandler.js';
import { startBookingScheduler } from './utils/bookingScheduler.js';
import { optimizeDatabase } from './utils/dbOptimize.js';

dotenv.config();

process.env.TZ = process.env.TZ || 'Asia/Kolkata';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration
app.use(cors({
  origin: isProduction ? 
    (origin, callback) => {
      // Allow any Vercel deployment URL
      if (!origin || origin.includes('vercel.app') || origin.includes('smartdesk')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } : 
    ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    localTime: new Date().toLocaleString(),
    timezone: process.env.TZ || 'UTC'
  });
});

// Public routes (no auth required)
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// Protected routes (auth required)
app.use('/api/buildings', authenticateToken, buildingRoutes);
app.use('/api/bookings', authenticateToken, bookingRoutes);
app.use('/api/wishlist', authenticateToken, wishlistRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/rooms', authenticateToken, roomRoutes);
app.use('/api/chatbot', authenticateToken, chatbotRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(sanitizeForLog(err.stack));
  res.status(500).json({ error: isProduction ? 'Something went wrong!' : sanitizeForLog(err.message) });
});

const server = createServer(app);
const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io ready for real-time updates`);
  
  // Check AI Chatbot status
  if (process.env.GEMINI_API_KEY) {
    console.log(`🤖 AI Chatbot: ACTIVATED (Gemini API connected)`);
  } else {
    console.log(`❌ AI Chatbot: DISABLED (No Gemini API key found)`);
  }
  
  // Start booking scheduler
  startBookingScheduler();
  console.log(`⏰ Booking scheduler started`);
  
  // Optimize database (safe indexes)
  optimizeDatabase();
});

// Handle server errors
app.on('error', (error) => {
  console.error('❌ Server error:', error);
});