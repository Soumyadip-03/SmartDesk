const { PrismaClient } = require('../backend/node_modules/.prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding with REAL data...');

    // Clear existing data
    await prisma.booking.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.room.deleteMany();
    await prisma.building.deleteMany();
    await prisma.user.deleteMany();
    await prisma.establishment.deleteMany();

    // Insert Real Establishment
    await prisma.establishment.create({
      data: {
        eId: 'BWU/2016',
        eName: 'Brainware University',
        eEmail: null
      }
    });

    // Insert Real Users
    const users = [
      {
        fId: 'ADMIN/01',
        fName: 'Soumyadip Khan Sarkar',
        fUsername: 'Soumyadip',
        fEmail: 'admin@smartdesk.com',
        fPassword: '$2a$10$oemjbohIr1DvApWJJOXg9uRk3XYT97vGoEiCf6h7B1DjmjBoV4mIm',
        fDepartment: 'B.TECH',
        fRole: 'admin',
        phoneNumber: '9123930450'
      },
      {
        fId: 'MOD/1',
        fName: 'Rajdeep De',
        fUsername: 'Rajdeep',
        fEmail: 'rajdeepde789@gmail.com',
        fPassword: '$2a$10$CqmXHMdJGDlNPVV6FlTokurz35P7vQTtIan25Cq57gk2EDc0SUC1a',
        fDepartment: 'Computer Science',
        fRole: 'moderator',
        phoneNumber: '8927261211'
      },
      {
        fId: 'MOD/2',
        fName: 'Sulagna Bhattacharya',
        fUsername: 'sulagnabhattacharya',
        fEmail: 'sulagnabhattacharya719@gmail.com',
        fPassword: '$2a$10$2ZbF/eyh5pmoDYwE4kap9.7VFVZ84PnEuE2UMHi1JXRNV/cpKCk/y',
        fDepartment: null,
        fRole: 'moderator',
        phoneNumber: null
      }
    ];

    for (const user of users) {
      await prisma.user.create({
        data: {
          ...user,
          eId: 'BWU/2016',
          profilePicture: null
        }
      });
    }

    // Insert Real Buildings
    const buildings = [
      { bName: 'Building - 01' },
      { bName: 'Building - 02' },
      { bName: 'Building - 03' },
      { bName: 'Building - 04' },
      { bName: 'Building - 05' },
      { bName: 'Building - 06' },
      { bName: 'Building - 07' }
    ];

    for (const building of buildings) {
      await prisma.building.create({
        data: {
          bName: building.bName,
          eId: 'BWU/2016'
        }
      });
    }

    // Insert Real Rooms (from your database)
    const realRooms = [
      // Building 1 - Special rooms with real data
      { bNo: 1, rNo: '001', capacity: 0, rType: 'Undefined', rStatus: 'Available' },
      { bNo: 1, rNo: '002', capacity: 0, rType: 'Undefined', rStatus: 'Available' },
      { bNo: 1, rNo: '003', capacity: 60, rType: 'Undefined', rStatus: 'Booked' },
      { bNo: 1, rNo: '004', capacity: 0, rType: 'Undefined', rStatus: 'Available' },
      { bNo: 1, rNo: '005', capacity: 0, rType: 'Undefined', rStatus: 'Available' },
      { bNo: 1, rNo: '006', capacity: 60, rType: 'Undefined', rStatus: 'Booked' },
      
      // Building 1 - Floor rooms
      ...Array.from({length: 6}, (_, i) => ({ 
        bNo: 1, rNo: (101 + i).toString(), capacity: 0, rType: 'Undefined', rStatus: 'Available' 
      })),
      ...Array.from({length: 6}, (_, i) => ({ 
        bNo: 1, rNo: (201 + i).toString(), capacity: 0, rType: 'Undefined', rStatus: 'Available' 
      })),
      ...Array.from({length: 6}, (_, i) => ({ 
        bNo: 1, rNo: (301 + i).toString(), capacity: 0, rType: 'Undefined', rStatus: 'Available' 
      })),
      ...Array.from({length: 6}, (_, i) => ({ 
        bNo: 1, rNo: (401 + i).toString(), capacity: 0, rType: 'Undefined', rStatus: 'Available' 
      })),
      ...Array.from({length: 6}, (_, i) => ({ 
        bNo: 1, rNo: (501 + i).toString(), capacity: 0, rType: 'Undefined', rStatus: 'Available' 
      }))
    ];

    // Add rooms for buildings 2-7
    for (let bNo = 2; bNo <= 7; bNo++) {
      // Ground floor (001-006)
      for (let i = 1; i <= 6; i++) {
        realRooms.push({
          bNo,
          rNo: i.toString().padStart(3, '0'),
          capacity: 0,
          rType: 'Undefined',
          rStatus: 'Available'
        });
      }
      
      // Floors 1-5 (101-106, 201-206, etc.)
      for (let floor = 1; floor <= 5; floor++) {
        for (let room = 1; room <= 6; room++) {
          const rNo = (floor * 100 + room).toString();
          realRooms.push({
            bNo,
            rNo,
            capacity: 0,
            rType: 'Undefined',
            rStatus: bNo === 3 && rNo === '504' ? 'Maintenance' : 'Available'
          });
        }
      }
    }

    for (const room of realRooms) {
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

    // Insert Real Bookings
    const realBookings = [
      {
        fId: 'MOD/1',
        bNo: 1,
        rNo: '006',
        date: new Date('2025-09-07'),
        startTime: new Date('2025-09-07T06:30:00.000Z'),
        endTime: new Date('2025-09-07T08:30:00.000Z'),
        status: 'confirmed',
        subject: 'DSA',
        numberOfStudents: 50,
        notes: null
      },
      {
        fId: 'MOD/1',
        bNo: 1,
        rNo: '003',
        date: new Date('2025-09-05'),
        startTime: new Date('2025-09-05T06:30:00.000Z'),
        endTime: new Date('2025-09-05T08:30:00.000Z'),
        status: 'confirmed',
        subject: 'DSA',
        numberOfStudents: 50,
        notes: null
      },
      {
        fId: 'MOD/1',
        bNo: 1,
        rNo: '006',
        date: new Date('2025-09-05'),
        startTime: new Date('2025-09-05T06:30:00.000Z'),
        endTime: new Date('2025-09-05T08:30:00.000Z'),
        status: 'confirmed',
        subject: 'DSA',
        numberOfStudents: 50,
        notes: null
      }
    ];

    for (const booking of realBookings) {
      await prisma.booking.create({
        data: booking
      });
    }

    console.log('✅ Database seeded successfully with REAL data!');
    console.log(`📊 Created:`);
    console.log(`   - 1 Establishment (Brainware University)`);
    console.log(`   - ${users.length} Real Users`);
    console.log(`   - 7 Buildings`);
    console.log(`   - ${realRooms.length} Real Rooms`);
    console.log(`   - ${realBookings.length} Real Bookings`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();