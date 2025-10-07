import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const password = process.env.ADMIN_PASSWORD || process.argv[2];
    if (!password) {
      console.error('❌ Error: Password required. Set ADMIN_PASSWORD env var or pass as argument.');
      process.exit(1);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Find or create establishment
    let establishment = await prisma.establishment.findUnique({
      where: { name: 'Tech University' }
    });
    
    if (!establishment) {
      establishment = await prisma.establishment.create({
        data: {
          name: 'Tech University',
          address: '123 University Ave, Tech City',
          phone: '+1-555-0123',
          email: 'admin@techuni.edu',
        },
      });
    }
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@smartdesk.com',
        name: 'Admin User',
        password: hashedPassword,
        department: 'Administration',
        facultyId: 'ADMIN001',
        establishmentId: establishment.id,
      },
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@smartdesk.com');
    console.log('🏢 Establishment:', establishment.name);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Admin user already exists!');
    } else {
      console.error('❌ Error creating admin:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();