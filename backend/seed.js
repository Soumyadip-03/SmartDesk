async function main() {
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');
  const prisma = new PrismaClient();
  try {
    // Insert Establishment first
    await prisma.establishment.create({
      data: {
        eId: 'BWU/2016',
        eName: 'Brainware University',
        eEmail: null
      }
    });

    // Insert Admin User
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await prisma.user.create({
      data: {
        fId: 'ADMIN/01',
        fName: 'Soumyadip Khan Sarkar',
        eId: 'BWU/2016',
        fUsername: 'Soumyadip',
        fEmail: 'admin@smartdesk.com',
        fPassword: hashedPassword,
        fDepartment: 'B.TECH',
        fRole: 'admin',
        phoneNumber: '9123930450',
        profilePicture: null
      }
    });

    // Insert Buildings
    const buildings = [
      { name: 'Building - 01', number: 1 },
      { name: 'Building - 02', number: 2 },
      { name: 'Building - 03', number: 3 },
      { name: 'Building - 04', number: 4 },
      { name: 'Building - 05', number: 5 },
      { name: 'Building - 06', number: 6 },
      { name: 'Building - 07', number: 7 }
    ];

    for (const building of buildings) {
      await prisma.building.create({
        data: {
          bName: building.name,
          eId: 'BWU/2016'
        }
      });
    }

    // Insert Rooms
    const roomData = [
      // Building 1 rooms
      ...Array.from({length: 5}, (_, i) => ({ bNo: 1, rNo: i + 2, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
      ...Array.from({length: 6}, (_, i) => ({ bNo: 1, rNo: 101 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
      ...Array.from({length: 6}, (_, i) => ({ bNo: 1, rNo: 201 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
      ...Array.from({length: 6}, (_, i) => ({ bNo: 1, rNo: 301 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
      ...Array.from({length: 6}, (_, i) => ({ bNo: 1, rNo: 401 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
      ...Array.from({length: 6}, (_, i) => ({ bNo: 1, rNo: 501 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
      { bNo: 1, rNo: 1, capacity: 0, rType: 'Undefined', rStatus: 'Available' }
    ];

    // Add rooms for buildings 2-7
    for (let building = 2; building <= 7; building++) {
      roomData.push(
        ...Array.from({length: 6}, (_, i) => ({ bNo: building, rNo: i + 1, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
        ...Array.from({length: 6}, (_, i) => ({ bNo: building, rNo: 101 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
        ...Array.from({length: 6}, (_, i) => ({ bNo: building, rNo: 201 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
        ...Array.from({length: 6}, (_, i) => ({ bNo: building, rNo: 301 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
        ...Array.from({length: 6}, (_, i) => ({ bNo: building, rNo: 401 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' })),
        ...Array.from({length: 6}, (_, i) => ({ bNo: building, rNo: 501 + i, capacity: 0, rType: 'Undefined', rStatus: 'Available' }))
      );
    }

    for (const room of roomData) {
      await prisma.room.create({
        data: {
          bNo: room.bNo,
          rNo: room.rNo,
          capacity: room.capacity,
          rType: room.rType,
          rStatus: room.rStatus,
          rTag: null
        }
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();