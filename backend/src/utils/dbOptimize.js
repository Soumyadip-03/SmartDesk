import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add indexes for faster queries (run once)
export const optimizeDatabase = async () => {
  try {
    // These are safe additions that won't break anything
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_booking_date_status ON "bookings" ("Date", "Status");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_booking_faculty_date ON "bookings" ("F_ID", "Date");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_room_building_status ON "rooms" ("B_NO", "R_Status");`;
    console.log('✅ Database indexes optimized');
  } catch (error) {
    console.log('Database indexes already exist or error:', error.message);
  }
};