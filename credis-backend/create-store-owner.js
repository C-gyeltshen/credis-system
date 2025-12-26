import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createStoreOwner() {
  try {
    const storeOwner = await prisma.storeOwner.create({
      data: {
        name: "Tenzin Wangdu",
        email: "tenzin.wangdu@store.com",
        passwordHash: "hashed_password_placeholder",
        storeId: "29740cc6-2406-414e-a168-ad0fb61f473e",
        isActive: true,
      },
    });
    console.log("Store owner created:", storeOwner);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createStoreOwner();
