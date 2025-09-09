const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all rooms
    const rooms = await prisma.room.findMany();
    
    for (const room of rooms) {
      // Convert single digit room numbers to 3-digit format
      let newRoomNumber = room.rNo;
      
      if (room.rNo >= 1 && room.rNo <= 9) {
        // Convert 1-9 to 001-009
        newRoomNumber = parseInt(`00${room.rNo}`);
      } else if (room.rNo >= 10 && room.rNo <= 99) {
        // Convert 10-99 to 010-099  
        newRoomNumber = parseInt(`0${room.rNo}`);
      }
      
      // Only update if room number changed
      if (newRoomNumber !== room.rNo) {
        // Delete old room
        await prisma.room.delete({
          where: {
            bNo_rNo: {
              bNo: room.bNo,
              rNo: room.rNo
            }
          }
        });
        
        // Create new room with updated number
        await prisma.room.create({
          data: {
            bNo: room.bNo,
            rNo: newRoomNumber,
            capacity: room.capacity,
            rType: room.rType,
            rStatus: room.rStatus,
            rTag: room.rTag
          }
        });
      }
    }

    console.log('Room numbers fixed to XXX format successfully!');
  } catch (error) {
    console.error('Error fixing room numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();