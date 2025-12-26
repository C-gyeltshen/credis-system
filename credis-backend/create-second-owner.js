import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSecondStoreOwner() {
  try {
    const storeOwner = await prisma.storeOwner.create({
      data: {
        name: 'Pema Tshering',
        email: 'pema.tshering@hardware.com',
        passwordHash: 'hashed_password_placeholder',
        storeId: '1de57b31-5822-4c4a-9155-5ac8578856b2',
        isActive: true
      }
    });
    console.log('Second store owner created:', storeOwner);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSecondStoreOwner();
