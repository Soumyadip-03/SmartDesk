const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all rooms
    const rooms = await prisma.room.findMany();
    
    for (const room of rooms) {
      // Convert room number to 3-digit format
      const paddedRoomNumber = room.rNo.toString().padStart(3, '0');
      
      // Update room number to 3-digit format
      await prisma.room.update({
        where: {
          bNo_rNo: {
            bNo: room.bNo,
            rNo: room.rNo
          }
        },
        data: {
          rNo: parseInt(paddedRoomNumber)
        }
      });
    }

    console.log('Room numbers updated to XXX format successfully!');
  } catch (error) {
    console.error('Error updating room numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();