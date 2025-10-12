import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting production database seed with real data...');

    // Embedded data from local database
    const data = {
      establishments: [
        { eId: 'BWU/2016', eName: 'Brainware University', eEmail: null },
        { eId: 'TECH001', eName: 'Tech University', eEmail: 'admin@techuni.edu' }
      ],
      users: [
        {
          fId: 'ADMIN/01',
          fName: 'Soumyadip Khan Sarkar',
          eId: 'BWU/2016',
          fUsername: 'Soumyadip',
          fEmail: 'admin@smartdesk.com',
          fPassword: '$2a$10$oemjbohIr1DvApWJJOXg9uRk3XYT97vGoEiCf6h7B1DjmjBoV4mIm',
          fDepartment: 'B.TECH',
          fRole: 'admin',
          phoneNumber: '9123930450',
          profilePicture: null
        },
        {
          fId: 'MOD/1',
          fName: 'Rajdeep De',
          eId: 'BWU/2016',
          fUsername: 'Rajdeep',
          fEmail: 'rajdeepde789@gmail.com',
          fPassword: '$2a$10$CqmXHMdJGDlNPVV6FlTokurz35P7vQTtIan25Cq57gk2EDc0SUC1a',
          fDepartment: 'Computer Science',
          fRole: 'moderator',
          phoneNumber: '8927261211',
          profilePicture: null
        },
        {
          fId: 'MOD/2',
          fName: 'Sulagna Bhattacharya',
          eId: 'BWU/2016',
          fUsername: 'Sulagna',
          fEmail: 'sulagnabhattacharya719@gmail.com',
          fPassword: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          fDepartment: 'B.TECH',
          fRole: 'moderator',
          phoneNumber: '8617264032',
          profilePicture: null
        }
      ],
      buildings: [
        { bName: 'Building - 01', eId: 'BWU/2016' },
        { bName: 'Building - 02', eId: 'BWU/2016' },
        { bName: 'Building - 03', eId: 'BWU/2016' },
        { bName: 'Building - 04', eId: 'BWU/2016' },
        { bName: 'Building - 05', eId: 'BWU/2016' },
        { bName: 'Building - 06', eId: 'BWU/2016' },
        { bName: 'Building - 07', eId: 'BWU/2016' }
      ]
    };
    
    // Generate rooms data
    const rooms = [];
    for (let bNo = 1; bNo <= 7; bNo++) {
      // Building 1 has special room numbering
      if (bNo === 1) {
        const roomNumbers = ['001', '002', '003', '004', '005', '006', '101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506'];
        roomNumbers.forEach(rNo => {
          let capacity = 0, rType = 'Undefined', rStatus = 'Available';
          if (rNo === '001') { capacity = 60; rType = 'Lecture Room'; rStatus = 'Maintenance'; }
          else if (rNo === '002') { capacity = 60; rType = 'Computer Lab'; rStatus = 'Booked'; }
          else if (rNo === '003') { capacity = 60; rType = 'Laboratory'; }
          else if (rNo === '006') { capacity = 60; }
          rooms.push({ bNo, rNo, capacity, rType, rStatus, rTag: null });
        });
      } else {
        // Other buildings have standard numbering
        const floors = ['001', '002', '003', '004', '005', '006', '101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', '406', '501', '502', '503', '504', '505', '506'];
        floors.forEach(rNo => {
          let rStatus = 'Available';
          if (bNo === 3 && rNo === '504') rStatus = 'Maintenance';
          if (bNo === 4 && rNo === '302') rStatus = 'Maintenance';
          if (bNo === 4 && rNo === '305') {
            rooms.push({ bNo, rNo, capacity: 60, rType: 'Undefined', rStatus, rTag: null });
          } else {
            rooms.push({ bNo, rNo, capacity: 0, rType: 'Undefined', rStatus, rTag: null });
          }
        });
      }
    }
    data.rooms = rooms;

    // Create Establishments
    for (const establishment of data.establishments) {
      await prisma.establishment.create({
        data: {
          eId: establishment.eId,
          eName: establishment.eName,
          eEmail: establishment.eEmail
        }
      });
    }
    console.log(`✅ ${data.establishments.length} Establishments created`);

    // Create Users (with existing hashed passwords)
    for (const user of data.users) {
      await prisma.user.create({
        data: {
          fId: user.fId,
          fName: user.fName,
          eId: user.eId,
          fUsername: user.fUsername,
          fEmail: user.fEmail,
          fPassword: user.fPassword, // Keep existing hashed passwords
          fDepartment: user.fDepartment,
          fRole: user.fRole,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture
        }
      });
    }
    console.log(`✅ ${data.users.length} Users created`);

    // Create Buildings
    for (const building of data.buildings) {
      await prisma.building.create({
        data: {
          bName: building.bName,
          eId: building.eId
        }
      });
    }
    console.log(`✅ ${data.buildings.length} Buildings created`);

    // Create Rooms
    for (const room of data.rooms) {
      await prisma.room.create({
        data: {
          bNo: room.bNo,
          rNo: room.rNo,
          capacity: room.capacity,
          rType: room.rType,
          rStatus: room.rStatus,
          rTag: room.rTag
        }
      });
    }
    console.log(`✅ ${data.rooms.length} Rooms created`);

    const finalUserCount = await prisma.user.count();
    const finalBuildingCount = await prisma.building.count();
    const finalRoomCount = await prisma.room.count();
    const finalEstablishmentCount = await prisma.establishment.count();
    
    console.log('\n🎉 Production database seed complete!');
    console.log(`🏛️  Establishments: ${finalEstablishmentCount}`);
    console.log(`👥 Users: ${finalUserCount}`);
    console.log(`🏢 Buildings: ${finalBuildingCount}`);
    console.log(`🚪 Rooms: ${finalRoomCount}`);
    console.log('\n📧 Login credentials:');
    console.log('   admin@smartdesk.com (Admin)');
    console.log('   rajdeepde789@gmail.com (Moderator)');
    console.log('   sulagnabhattacharya719@gmail.com (Moderator)');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();