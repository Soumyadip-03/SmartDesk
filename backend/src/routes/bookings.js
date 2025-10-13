import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { cache } from '../utils/cache.js';
import { createNotificationForAllUsers } from './notifications.js';
import { emitRoomStatusChange, emitBookingUpdate } from '../socket/socketHandler.js';
import emailService from '../services/emailService.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { fId: req.user.facultyId },
      include: { room: { include: { building: true } } }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple booking conflict check without caching
const checkBookingConflicts = async (roomNumber, buildingNumber, date, startTime, endTime, excludeBookingId = null) => {
  const startDateTime = new Date(`${date}T${startTime}:00+05:30`);
  const endDateTime = new Date(`${date}T${endTime}:00+05:30`);
  
  const conflictBooking = await prisma.booking.findFirst({
    where: {
      rNo: roomNumber,
      bNo: parseInt(buildingNumber),
      date: new Date(date),
      status: { in: ['confirmed', 'pending'] },
      bookingId: excludeBookingId ? { not: excludeBookingId } : undefined,
      startTime: { lt: endDateTime },
      endTime: { gt: startDateTime }
    },
    include: {
      user: {
        select: { fName: true }
      }
    }
  });
  
  return conflictBooking ? [{ conflict: true, facultyName: conflictBooking.user.fName }] : [];
};

// Swap to available room immediately
router.post('/swap', authenticateToken, async (req, res) => {
  try {
    const { roomNumber, buildingNumber, courseSubject, numberOfStudents, purpose, notes, currentRoom } = req.body;
    
    // Validate required fields
    if (!roomNumber || !buildingNumber || !currentRoom) {
      return res.status(400).json({ error: 'Room details and current room are required for swap' });
    }
    
    // Parse currentRoom format: "buildingNumber-roomNumber" or just "roomNumber"
    let currentRoomNumber, currentBuildingNumber;
    if (currentRoom.includes('-')) {
      const [bNum, rNum] = currentRoom.split('-');
      currentBuildingNumber = parseInt(bNum);
      currentRoomNumber = rNum;
    } else {
      // Same building if no building number specified
      currentBuildingNumber = parseInt(buildingNumber);
      currentRoomNumber = currentRoom;
    }
    
    const now = new Date();
    
    // Find the current active booking to get time details
    const currentBooking = await prisma.booking.findFirst({
      where: {
        fId: req.user.facultyId,
        rNo: currentRoomNumber,
        bNo: currentBuildingNumber,
        status: { in: ['confirmed', 'ongoing'] },
        startTime: { lte: now },
        endTime: { gte: now }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!currentBooking) {
      return res.status(400).json({ error: `No active booking found in room ${currentRoomNumber} (Building ${currentBuildingNumber}). Make sure you have an active booking in that room.` });
    }
    
    // Prevent swapping to the same room
    if (currentBooking.rNo === roomNumber && currentBooking.bNo === parseInt(buildingNumber)) {
      return res.status(400).json({ error: 'You cannot swap to the same room you are currently in.' });
    }
    
    // Use the current booking's time details
    const startDateTime = currentBooking.startTime;
    const endDateTime = currentBooking.endTime;
    const swapDate = currentBooking.date;
    
    // Check if new room is available for the time slot
    const conflictBooking = await prisma.booking.findFirst({
      where: {
        rNo: roomNumber,
        bNo: parseInt(buildingNumber),
        date: swapDate,
        status: { in: ['confirmed', 'pending'] },
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime }
      },
      include: {
        user: {
          select: { fName: true }
        }
      }
    });
    
    if (conflictBooking) {
      return res.status(409).json({ 
        error: `Room is already booked by ${conflictBooking.user.fName}` 
      });
    }
    
    // Create the swap booking with ongoing status if currently active
    const isCurrentlyActive = now >= startDateTime && now <= endDateTime;
    const booking = await prisma.booking.create({
      data: {
        fId: req.user.facultyId,
        rNo: roomNumber,
        bNo: parseInt(buildingNumber),
        date: swapDate,
        startTime: startDateTime,
        endTime: endDateTime,
        status: isCurrentlyActive ? 'ongoing' : 'confirmed',
        subject: courseSubject || purpose || currentBooking.subject,
        numberOfStudents: numberOfStudents ? parseInt(numberOfStudents) : currentBooking.numberOfStudents,
        notes: notes || currentBooking.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Mark the current booking as swapped
    await prisma.booking.update({
      where: { bookingId: currentBooking.bookingId },
      data: {
        status: 'swapped',
        updatedAt: new Date()
      }
    });
    
    // Update room statuses in database
    // Check if old room has any other active bookings
    const otherBookingsInOldRoom = await prisma.booking.findFirst({
      where: {
        rNo: currentRoomNumber,
        bNo: currentBuildingNumber,
        status: { in: ['confirmed', 'ongoing'] },
        startTime: { lte: now },
        endTime: { gte: now },
        bookingId: { not: currentBooking.bookingId }
      }
    });
    
    // Update old room status only if no other active bookings
    if (!otherBookingsInOldRoom) {
      await prisma.room.updateMany({
        where: {
          rNo: currentRoomNumber,
          bNo: currentBuildingNumber
        },
        data: { rStatus: 'Available' }
      });
    }
    
    // Update new room status to Booked
    await prisma.room.updateMany({
      where: {
        rNo: roomNumber,
        bNo: parseInt(buildingNumber)
      },
      data: { rStatus: 'Booked' }
    });
    
    // Cache invalidation (safe fallback)
    try {
      await cache.invalidateRoom(currentBuildingNumber, currentRoomNumber);
      await cache.invalidateRoom(parseInt(buildingNumber), roomNumber);
    } catch (error) {
      console.log('Cache invalidation failed (non-critical):', error.message);
    }

    // Get user name for notification
    const user = await prisma.user.findUnique({
      where: { fId: req.user.facultyId },
      select: { fName: true }
    });
    
    // Create combined notification for all users
    const userName = user?.fName || 'Someone';
    const timeStr = `${startDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const message = `${userName} swapped Room ${currentRoom} with Room ${roomNumber} (Building ${buildingNumber}) ${timeStr}`;
    
    await createNotificationForAllUsers(
      'booking',
      'Room Swap',
      message,
      false
    );

    // Emit real-time updates for both rooms and bookings
    emitRoomStatusChange(currentBuildingNumber, currentRoomNumber, 'Available');
    emitRoomStatusChange(buildingNumber, roomNumber, 'Booked');
    emitBookingUpdate(req.user.facultyId, booking);
    emitBookingUpdate(req.user.facultyId, { ...currentBooking, status: 'swapped' });
    
    console.log('Room swap booking created:', booking);
    res.json(booking);
  } catch (error) {
    console.error('Room swap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create booking with conflict checking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { roomNumber, buildingNumber, date, startTime, endTime, bookingType = 'now', purpose, notes, courseSubject, numberOfStudents } = req.body;
    
    // Validate required fields
    if (!roomNumber || !buildingNumber || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'All booking fields are required' });
    }
    
    // Allow all authenticated users to create bookings
    if (!req.user || !req.user.facultyId) {
      return res.status(403).json({ error: 'Authentication required' });
    }

    // Create proper TIMESTAMPTZ values for booking times
    const bookingDate = new Date(date);
    const startDateTime = new Date(`${date}T${startTime}:00+05:30`);
    const endDateTime = new Date(`${date}T${endTime}:00+05:30`);
    
    // Fast conflict check using optimized function
    const conflicts = await checkBookingConflicts(roomNumber, buildingNumber, date, startTime, endTime);
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        error: `Room is already booked by ${conflicts[0].facultyName}` 
      });
    }
    
    const booking = await prisma.booking.create({
      data: {
        fId: req.user.facultyId,
        rNo: roomNumber,
        bNo: parseInt(buildingNumber),
        date: bookingDate,
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'confirmed',
        subject: courseSubject || purpose || null,
        numberOfStudents: numberOfStudents ? parseInt(numberOfStudents) : null,
        notes: notes || null
      }
    });
    
    // Only update room status to Booked if booking starts now or already started
    const now = new Date();
    if (startDateTime <= now) {
      await prisma.room.updateMany({
        where: {
          rNo: roomNumber,
          bNo: parseInt(buildingNumber)
        },
        data: { rStatus: 'Booked' }
      });
      
      // Safe cache invalidation
      try {
        await cache.invalidateRoom(parseInt(buildingNumber), roomNumber);
      } catch (error) {
        console.log('Cache invalidation failed (non-critical):', error.message);
      }
    }

    // Get user name for notification
    const user = await prisma.user.findUnique({
      where: { fId: req.user.facultyId },
      select: { fName: true }
    });
    
    // Create notification for all users
    const userName = user?.fName || 'Someone';
    const timeStr = `${startTime} - ${endTime}`;
    await createNotificationForAllUsers(
      'booking',
      'New Room Booking',
      `${userName} booked Room ${roomNumber} (Building ${buildingNumber}) on ${bookingDate.toDateString()} from ${timeStr}`,
      false
    );

    // Send email notification if enabled
    const userSettings = await prisma.user.findUnique({
      where: { fId: req.user.facultyId },
      select: { fEmail: true }
    });
    
    if (userSettings?.fEmail) {
      const emailNotifications = req.headers['x-email-notifications'] === 'true';
      if (emailNotifications) {
        await emailService.sendBookingConfirmation(userSettings.fEmail, {
          roomNumber,
          buildingNumber,
          date: bookingDate.toISOString().split('T')[0],
          startTime,
          endTime,
          purpose: courseSubject || purpose || 'Not specified',
          numberOfStudents: numberOfStudents || 'Not specified'
        });
      }
    }

    // Emit real-time updates
    emitRoomStatusChange(buildingNumber, roomNumber, 'Booked');
    emitBookingUpdate(req.user.facultyId, booking);
    
    console.log('Booking created:', booking);
    res.json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel booking (set status to cancelled)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { 
        bookingId: parseInt(req.params.id), 
        fId: req.user.facultyId 
      },
      include: { room: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking status
    await prisma.booking.update({
      where: { bookingId: parseInt(req.params.id) },
      data: { status: 'cancelled' }
    });
    
    // Update room status to Available
    await prisma.room.updateMany({
      where: {
        rNo: booking.rNo,
        bNo: booking.bNo
      },
      data: { rStatus: 'Available' }
    });
    
    // Get user name for notification
    const user = await prisma.user.findUnique({
      where: { fId: req.user.facultyId },
      select: { fName: true }
    });
    
    // Create notification for all users about cancellation
    const userName = user?.fName || 'Someone';
    const timeStr = `${booking.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${booking.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    await createNotificationForAllUsers(
      'booking',
      'Booking Cancelled',
      `${userName} cancelled booking for Room ${booking.rNo} (Building ${booking.bNo}) ${timeStr}`,
      false
    );

    // Send email notification if enabled
    const userSettings = await prisma.user.findUnique({
      where: { fId: req.user.facultyId },
      select: { fEmail: true }
    });
    
    if (userSettings?.fEmail) {
      const emailNotifications = req.headers['x-email-notifications'] === 'true';
      if (emailNotifications) {
        await emailService.sendBookingCancellation(userSettings.fEmail, {
          roomNumber: booking.rNo,
          buildingNumber: booking.bNo.toString(),
          date: booking.date,
          startTime: booking.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: booking.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        });
      }
    }

    // Safe cache invalidation
    try {
      await cache.invalidateRoom(booking.bNo, booking.rNo);
    } catch (error) {
      console.log('Cache invalidation failed (non-critical):', error.message);
    }

    // Emit real-time updates
    emitRoomStatusChange(booking.bNo, booking.rNo, 'Available');
    emitBookingUpdate(req.user.facultyId, { ...booking, status: 'cancelled' });
    
    console.log('Booking cancelled:', req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete booking (permanently remove)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { 
        bookingId: parseInt(req.params.id), 
        fId: req.user.facultyId 
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update room status to Available
    await prisma.room.updateMany({
      where: {
        rNo: booking.rNo,
        bNo: booking.bNo
      },
      data: { rStatus: 'Available' }
    });
    
    // Get user name for notification before deleting
    const user = await prisma.user.findUnique({
      where: { fId: req.user.facultyId },
      select: { fName: true }
    });
    
    // Delete booking permanently
    await prisma.booking.delete({
      where: { bookingId: parseInt(req.params.id) }
    });
    
    // Create notification for all users about deletion
    const userName = user?.fName || 'Someone';
    const timeStr = `${booking.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${booking.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    await createNotificationForAllUsers(
      'booking',
      'Booking Deleted',
      `${userName} deleted booking for Room ${booking.rNo} (Building ${booking.bNo}) ${timeStr}`,
      false
    );

    // Safe cache invalidation
    try {
      await cache.invalidateRoom(booking.bNo, booking.rNo);
    } catch (error) {
      console.log('Cache invalidation failed (non-critical):', error.message);
    }

    // Emit real-time updates
    emitRoomStatusChange(booking.bNo, booking.rNo, 'Available');
    
    console.log('Booking deleted:', req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Booking deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Swap room booking
router.post('/:id/swap', authenticateToken, async (req, res) => {
  try {
    const { newRoomNumber, newBuildingNumber } = req.body;
    const bookingId = req.params.id;

    // Check user role
    if (!['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only admins and moderators can swap bookings' });
    }

    // Get original booking
    const originalBooking = await prisma.booking.findFirst({
      where: { bookingId: parseInt(bookingId), fId: req.user.facultyId },
      include: { room: true }
    });

    if (!originalBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if new room is available
    const conflicts = await checkBookingConflicts(
      newRoomNumber, 
      newBuildingNumber, 
      originalBooking.date, 
      originalBooking.startTime, 
      originalBooking.endTime
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'New room is not available for this time slot' });
    }

    // Create new booking
    const newBooking = await prisma.booking.create({
      data: {
        facultyId: req.user.facultyId,
        roomNumber: parseInt(newRoomNumber),
        buildingNumber: newBuildingNumber,
        date: originalBooking.date,
        startTime: originalBooking.startTime,
        endTime: originalBooking.endTime,
        bookingType: originalBooking.bookingType,
        purpose: originalBooking.purpose,
        notes: originalBooking.notes,
        swappedFrom: originalBooking.id,
        isLocked: originalBooking.isLocked,
        lockedUntil: originalBooking.lockedUntil
      },
      include: { room: { include: { building: true } } }
    });

    // Update original booking
    await prisma.booking.update({
      where: { bookingId: parseInt(bookingId) },
      data: { 
        status: 'swapped'
      }
    });

    // Update room statuses
    if (originalBooking.bookingType === 'now') {
      // Free old room
      await prisma.room.update({
        where: {
          roomNumber_buildingNumber: {
            roomNumber: originalBooking.roomNumber,
            buildingNumber: originalBooking.buildingNumber
          }
        },
        data: {
          roomStatus: 'Available',
          facultyId: null,
          startTime: null,
          endTime: null
        }
      });

      // Book new room
      await prisma.room.update({
        where: {
          roomNumber_buildingNumber: {
            roomNumber: parseInt(newRoomNumber),
            buildingNumber: newBuildingNumber
          }
        },
        data: {
          roomStatus: 'Booked',
          facultyId: req.user.facultyId,
          startTime: new Date(`${originalBooking.date.toISOString().split('T')[0]}T${originalBooking.startTime}`),
          endTime: new Date(`${originalBooking.date.toISOString().split('T')[0]}T${originalBooking.endTime}`)
        }
      });
    }

    // Log room swap
    console.log('Room swapped successfully');

    res.json({ 
      message: 'Room swapped successfully',
      originalBooking,
      newBooking
    });
  } catch (error) {
    console.error('Room swap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available rooms for a time slot
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const { date, startTime, endTime, buildingNumber } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }

    // Get all rooms
    const allRooms = await prisma.room.findMany({
      where: buildingNumber ? { buildingNumber } : {},
      include: { building: true }
    });

    // Check which rooms have conflicts
    const availableRooms = [];
    for (const room of allRooms) {
      const conflicts = await checkBookingConflicts(
        room.roomNumber,
        room.buildingNumber,
        date,
        startTime,
        endTime
      );
      
      if (conflicts.length === 0 && room.roomStatus !== 'Maintenance') {
        availableRooms.push(room);
      }
    }

    res.json(availableRooms);
  } catch (error) {
    console.error('Available rooms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active bookings for a building on a specific date
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const { buildingNumber, date } = req.query;

    if (!buildingNumber || !date) {
      return res.status(400).json({ error: 'Building number and date are required' });
    }

    const bookingDate = new Date(date);
    const now = new Date();

    // Get all confirmed bookings for the building on the specified date
    const activeBookings = await prisma.booking.findMany({
      where: {
        bNo: parseInt(buildingNumber),
        date: bookingDate,
        status: 'confirmed',
        startTime: { lte: now },
        endTime: { gte: now }
      },
      include: {
        user: {
          select: { fName: true }
        }
      }
    });

    res.json(activeBookings);
  } catch (error) {
    console.error('Active bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all bookings for a building on a specific date
router.get('/building/:buildingNumber', authenticateToken, async (req, res) => {
  try {
    const { buildingNumber } = req.params;
    const { date } = req.query;

    if (!buildingNumber) {
      return res.status(400).json({ error: 'Building number is required' });
    }

    const bookingDate = date ? new Date(date) : new Date();

    // Get all confirmed bookings for the building on the specified date
    const buildingBookings = await prisma.booking.findMany({
      where: {
        bNo: parseInt(buildingNumber),
        date: bookingDate,
        status: 'confirmed'
      },
      include: {
        user: {
          select: { fName: true }
        }
      }
    });

    res.json(buildingBookings);
  } catch (error) {
    console.error('Building bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk booking creation for admin (recurring schedules)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create bulk schedules' });
    }

    const { roomNumber, buildingNumber, startDate, duration, daysOfWeek, startTime, endTime, subject, facultyId } = req.body;

    if (!roomNumber || !buildingNumber || !startDate || !duration || !daysOfWeek || !startTime || !endTime || !subject || !facultyId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify faculty exists
    const faculty = await prisma.user.findUnique({ where: { fId: facultyId } });
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + parseInt(duration));

    const bookings = [];
    const currentDate = new Date(start);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
      
      if (daysOfWeek.includes(dayOfWeek.toString())) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const startDateTime = new Date(`${dateStr}T${startTime}:00+05:30`);
        const endDateTime = new Date(`${dateStr}T${endTime}:00+05:30`);

        // Check for conflicts
        const conflict = await prisma.booking.findFirst({
          where: {
            rNo: roomNumber,
            bNo: parseInt(buildingNumber),
            date: currentDate,
            status: { in: ['confirmed', 'pending'] },
            startTime: { lt: endDateTime },
            endTime: { gt: startDateTime }
          }
        });

        if (!conflict) {
          const booking = await prisma.booking.create({
            data: {
              fId: facultyId,
              rNo: roomNumber,
              bNo: parseInt(buildingNumber),
              date: new Date(currentDate),
              startTime: startDateTime,
              endTime: endDateTime,
              status: 'confirmed',
              subject: subject,
              numberOfStudents: null,
              notes: 'Bulk scheduled by admin'
            }
          });
          bookings.push(booking);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({ message: 'Bulk schedule created', count: bookings.length, bookings });
  } catch (error) {
    console.error('Bulk booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;