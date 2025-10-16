import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://smartdesk.yourdomain.com'] 
        : ['http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('⚠️ Socket connection without token');
      socket.userId = 'anonymous';
      socket.userEmail = 'anonymous';
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.facultyId;
      socket.userEmail = decoded.facultyId; // Use facultyId as identifier
      console.log(`✅ Socket authenticated: ${decoded.facultyId}`);
      next();
    } catch (err) {
      console.log('❌ Socket auth failed:', err.message);
      socket.userId = 'anonymous';
      socket.userEmail = 'anonymous';
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Join building rooms for room updates
    socket.on('joinBuilding', (buildingNumber) => {
      socket.join(`building_${buildingNumber}`);
    });

    // Leave building room
    socket.on('leaveBuilding', (buildingNumber) => {
      socket.leave(`building_${buildingNumber}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Emit room status change to all users in building
export const emitRoomStatusChange = (buildingNumber, roomNumber, status) => {
  if (io) {
    io.to(`building_${buildingNumber}`).emit('roomStatusChanged', {
      buildingNumber,
      roomNumber,
      status,
      timestamp: new Date().toISOString()
    });
  }
};

// Emit booking update to specific user
export const emitBookingUpdate = (userId, booking) => {
  if (io) {
    io.to(`user_${userId}`).emit('bookingUpdated', {
      booking,
      timestamp: new Date().toISOString()
    });
  }
};

// Emit notification to specific user
export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('newNotification', {
      notification,
      timestamp: new Date().toISOString()
    });
  }
};

export const getIO = () => io;