import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncFrontendData() {
  try {
    // Buildings from frontend (Building 1-7)
    const buildings = [
      { buildingNumber: '1', name: 'Building - 01' },
      { buildingNumber: '2', name: 'Building - 02' },
      { buildingNumber: '3', name: 'Building - 03' },
      { buildingNumber: '4', name: 'Building - 04' },
      { buildingNumber: '5', name: 'Building - 05' },
      { buildingNumber: '6', name: 'Building - 06' },
      { buildingNumber: '7', name: 'Building - 07' }
    ];

    // Create buildings
    for (const building of buildings) {
      await prisma.building.create({
        data: {
          buildingNumber: building.buildingNumber,
          name: building.name,
          establishmentId: 'BWU/2016'
        }
      });
    }
    console.log(`✅ Created ${buildings.length} buildings`);

    // Generate rooms for each building
    const roomsData = [];
    
    for (const building of buildings) {
      const floors = [0, 1, 2, 3, 4, 5]; // Ground floor (0) + 5 floors
      const roomsPerFloor = 6;

      floors.forEach(floor => {
        for (let roomIndex = 1; roomIndex <= roomsPerFloor; roomIndex++) {
          const roomPrefix = floor === 0 ? "00" : `${floor}0`;
          const roomNumber = `${roomPrefix}${roomIndex}`;
          
          roomsData.push({
            buildingNumber: building.buildingNumber,
            roomNumber: roomNumber,
            roomType: 'Undefined',
            roomStatus: 'Available',
            facultyId: null,
            startTime: null,
            endTime: null,
            capacity: 0
          });
        }
      });
    }

    // Create all rooms
    await prisma.room.createMany({
      data: roomsData
    });

    console.log(`✅ Created ${roomsData.length} rooms`);
    console.log('✅ Frontend data synced successfully!');
    
    // Verify order
    const rooms = await prisma.room.findMany({
      orderBy: [
        { buildingNumber: 'asc' },
        { roomNumber: 'asc' }
      ],
      take: 10
    });

    console.log('\nFirst 10 rooms:');
    rooms.forEach((room, index) => {
      console.log(`${index + 1}. Building ${room.buildingNumber} - Room ${room.roomNumber}`);
    });

  } catch (error) {
    console.error('❌ Error syncing frontend data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncFrontendData();