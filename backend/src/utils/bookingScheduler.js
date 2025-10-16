import { PrismaClient } from '@prisma/client';
import { emitRoomStatusChange } from '../socket/socketHandler.js';
import { createNotificationForUser } from '../routes/notifications.js';

const prisma = new PrismaClient();

// Check and update bookings every 30 seconds
export const startBookingScheduler = () => {
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Find bookings starting now to send reminders
      const startingBookings = await prisma.booking.findMany({
        where: {
          status: 'confirmed',
          startTime: { lte: now },
          endTime: { gte: now }
        },
        include: {
          user: { select: { fName: true } }
        }
      });
      
      // Send start reminders and update status
      for (const booking of startingBookings) {
        // Send start reminder notification
        await createNotificationForUser(
          booking.fId,
          'reminder',
          'Booking Started',
          `Your booking for Room ${booking.rNo} (Building ${booking.bNo}) has started and will end at ${booking.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
          true
        );
      }
      
      // Update booking status to 'ongoing'
      await prisma.booking.updateMany({
        where: {
          status: 'confirmed',
          startTime: { lte: now },
          endTime: { gte: now }
        },
        data: { status: 'ongoing' }
      });
      
      // Find newly ongoing bookings (just changed from confirmed)
      const newlyOngoingBookings = await prisma.booking.findMany({
        where: {
          status: 'ongoing',
          startTime: { lte: now },
          endTime: { gte: now },
          updatedAt: { gte: new Date(now.getTime() - 6000) } // Only recently updated
        }
      });
      
      // Update room status for newly ongoing bookings
      for (const booking of newlyOngoingBookings) {
        await prisma.room.updateMany({
          where: {
            rNo: booking.rNo,
            bNo: booking.bNo
          },
          data: { rStatus: 'Booked' }
        });
        
        // Emit real-time update
        emitRoomStatusChange(booking.bNo, booking.rNo, 'Booked');
      }
      
      // Find bookings ending now to send reminders
      const endingBookings = await prisma.booking.findMany({
        where: {
          status: 'ongoing',
          endTime: { lt: now }
        },
        include: {
          user: { select: { fName: true } }
        }
      });
      
      // Send end reminders
      for (const booking of endingBookings) {
        // Send end reminder notification
        await createNotificationForUser(
          booking.fId,
          'reminder',
          'Booking Ended',
          `Your booking for Room ${booking.rNo} (Building ${booking.bNo}) has ended. Please vacate the room.`,
          true
        );
      }
      
      // Update booking status to 'finished' (only ongoing bookings)
      const finishedResult = await prisma.booking.updateMany({
        where: {
          status: 'ongoing',
          endTime: { lt: now }
        },
        data: { status: 'finished' }
      });
      
      // Find newly finished bookings to update room status
      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: 'finished',
          endTime: { lt: now },
          updatedAt: { gte: new Date(now.getTime() - 6000) } // Only recently updated
        }
      });
      
      // Update room status for expired bookings
      for (const booking of expiredBookings) {
        // Check if room has any other active bookings
        const otherActiveBookings = await prisma.booking.findFirst({
          where: {
            rNo: booking.rNo,
            bNo: booking.bNo,
            status: 'confirmed',
            startTime: { lte: now },
            endTime: { gte: now },
            bookingId: { not: booking.bookingId }
          }
        });
        
        // Only update room status if no other active bookings
        if (!otherActiveBookings) {
          await prisma.room.updateMany({
            where: {
              rNo: booking.rNo,
              bNo: booking.bNo
            },
            data: { rStatus: 'Available' }
          });
          
          // Emit real-time update
          emitRoomStatusChange(booking.bNo, booking.rNo, 'Available');
        }
      }
      
      const totalUpdates = newlyOngoingBookings.length + expiredBookings.length;
      const totalReminders = startingBookings.length + endingBookings.length;
      if (totalUpdates > 0 || totalReminders > 0) {
        console.log(`Updated ${newlyOngoingBookings.length} ongoing and ${expiredBookings.length} expired bookings`);
        console.log(`Sent ${startingBookings.length} start and ${endingBookings.length} end reminders`);
      }
    } catch (error) {
      console.error('Booking scheduler error:', error);
    }
  }, 5000); // Run every 5 seconds
};