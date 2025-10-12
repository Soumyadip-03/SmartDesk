import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add indexes for faster queries (run once)
export const optimizeDatabase = async () => {
  try {
    // These are safe additions that won't break anything
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_booking_date_status ON "Booking" ("date", "status");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_booking_faculty_date ON "Booking" ("fId", "date");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_room_building_status ON "Room" ("bNo", "rStatus");`;
    console.log('✅ Database indexes optimized');
  } catch (error) {
    console.log('Database indexes already exist or error:', error.message);
  }
};