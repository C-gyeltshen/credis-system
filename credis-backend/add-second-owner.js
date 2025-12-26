import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addSecondOwnerToFirstStore() {
  try {
    const storeOwner = await prisma.storeOwner.create({
      data: {
        name: "Karma Dorji",
        email: "karma.dorji@store.com",
        passwordHash: "hashed_password_placeholder",
        storeId: "29740cc6-2406-414e-a168-ad0fb61f473e", // First store
        isActive: true,
      },
    });
    console.log("Second owner for first store created:", storeOwner);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSecondOwnerToFirstStore();
