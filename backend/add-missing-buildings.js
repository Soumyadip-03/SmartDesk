import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function addMissingBuildings() {
  try {
    const existingBuildings = await prisma.building.findMany({
      select: { bName: true }
    });
    
    const existingNames = existingBuildings.map(b => b.bName);
    console.log('Existing buildings:', existingNames);
    
    const allBuildings = [
      'Building - 01', 'Building - 02', 'Building - 03', 
      'Building - 04', 'Building - 05', 'Building - 06', 'Building - 07'
    ];
    
    const missingBuildings = allBuildings.filter(name => !existingNames.includes(name));
    
    if (missingBuildings.length === 0) {
      console.log('✅ All buildings already exist');
      return;
    }
    
    console.log('Missing buildings:', missingBuildings);
    
    for (const buildingName of missingBuildings) {
      const building = await prisma.building.create({
        data: {
          bName: buildingName,
          eId: 'BWU/2016'
        }
      });
      
      // Add rooms for this building
      const bNo = building.bNo;
      for (let floor = 1; floor <= 3; floor++) {
        for (let room = 1; room <= 4; room++) {
          const rNo = `${floor}0${room}`;
          const roomTypes = ['Classroom', 'Lab', 'Lecture Hall', 'Conference Room'];
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
      
      console.log(`✅ Added ${buildingName} with 12 rooms`);
    }
    
    const finalCount = await prisma.building.count();
    const finalRoomCount = await prisma.room.count();
    
    console.log(`\n✅ Complete! Total buildings: ${finalCount}, Total rooms: ${finalRoomCount}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingBuildings();