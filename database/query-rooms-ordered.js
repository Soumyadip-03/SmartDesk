import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function getRoomsInAscendingOrder(buildingNumber = null) {
  try {
    const rooms = await prisma.room.findMany({
      where: buildingNumber ? { buildingNumber } : {},
      orderBy: [
        { buildingNumber: 'asc' },
        { roomNumber: 'asc' }
      ],
      include: {
        building: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('Rooms in ascending order:');
    console.log('========================');
    
    rooms.forEach(room => {
      console.log(`${room.buildingNumber}-${room.roomNumber}: ${room.name || 'Unnamed Room'} (Capacity: ${room.capacity})`);
    });

    return rooms;
  } catch (error) {
    console.error('Error fetching rooms:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
getRoomsInAscendingOrder();