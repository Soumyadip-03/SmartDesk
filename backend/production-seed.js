import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting production database seed with real data...');

    // Read exported data
    const data = JSON.parse(fs.readFileSync('database-export.json', 'utf8'));

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