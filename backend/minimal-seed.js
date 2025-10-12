import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    // Check and insert Establishment
    const existingEst = await prisma.establishment.findUnique({
      where: { eId: 'BWU/2016' }
    });
    
    if (!existingEst) {
      await prisma.establishment.create({
        data: {
          eId: 'BWU/2016',
          eName: 'Brainware University',
          eEmail: null
        }
      });
      console.log('✅ Establishment created');
    } else {
      console.log('ℹ️ Establishment already exists');
    }

    // Check and insert Admin User
    const existingUser = await prisma.user.findUnique({
      where: { fEmail: 'admin@smartdesk.com' }
    });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          fId: 'ADMIN/01',
          fName: 'Admin User',
          eId: 'BWU/2016',
          fUsername: 'admin',
          fEmail: 'admin@smartdesk.com',
          fPassword: hashedPassword,
          fDepartment: 'Administration',
          fRole: 'admin',
          phoneNumber: '9123930450'
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Check and insert Buildings
    const buildingCount = await prisma.building.count();
    
    if (buildingCount === 0) {
      const buildings = [
        { name: 'Building - 01' },
        { name: 'Building - 02' },
        { name: 'Building - 03' },
        { name: 'Building - 04' },
        { name: 'Building - 05' }
      ];

      for (const building of buildings) {
        await prisma.building.create({
          data: {
            bName: building.name,
            eId: 'BWU/2016'
          }
        });
      }
      console.log('✅ Buildings created');
    } else {
      console.log('ℹ️ Buildings already exist');
    }

    // Check and insert sample rooms
    const roomCount = await prisma.room.count();
    
    if (roomCount === 0) {
      const roomTypes = ['Classroom', 'Lab', 'Lecture Hall', 'Conference Room'];
      
      for (let bNo = 1; bNo <= 5; bNo++) {
        for (let floor = 1; floor <= 3; floor++) {
          for (let room = 1; room <= 4; room++) {
            const rNo = `${floor}0${room}`;
            const randomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
            const capacity = randomType === 'Lab' ? 25 : randomType === 'Lecture Hall' ? 50 : 30;
            
            await prisma.room.create({
              data: {
                bNo: bNo,
                rNo: rNo,
                capacity: capacity,
                rType: randomType,
                rStatus: 'Available'
              }
            });
          }
        }
      }
      console.log('✅ Rooms created');
    } else {
      console.log('ℹ️ Rooms already exist');
    }

    const finalUserCount = await prisma.user.count();
    const finalBuildingCount = await prisma.building.count();
    const finalRoomCount = await prisma.room.count();
    
    console.log('\n✅ Database setup complete!');
    console.log(`👥 Total users: ${finalUserCount}`);
    console.log(`🏢 Total buildings: ${finalBuildingCount}`);
    console.log(`🚪 Total rooms: ${finalRoomCount}`);
    console.log('\n📧 Admin login: admin@smartdesk.com');
    console.log('🔑 Admin password: admin123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();