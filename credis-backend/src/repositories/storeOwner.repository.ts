import { prisma } from "../../lib/prisma.js";
import type {
  CreateStoreOwnerInput,
  UpdateStoreOwnerInput,
} from "../types/storeOwner.types.js";

export class StoreOwnerRepository {
  async create(data: CreateStoreOwnerInput) {
    return await prisma.storeOwner.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.password,
        ...(data.storeId && { storeId: data.storeId }),
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.storeOwner.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await prisma.storeOwner.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return await prisma.storeOwner.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: UpdateStoreOwnerInput) {
    return await prisma.storeOwner.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.passwordHash && { passwordHash: data.passwordHash }),
        ...(data.storeId && { storeId: data.storeId }),
        ...(typeof data.isActive === "boolean" && { isActive: data.isActive }),
        ...(data.lastLoginAt && { lastLoginAt: data.lastLoginAt }),
      },
    });
  }

  async delete(id: string) {
    return await prisma.storeOwner.delete({
      where: { id },
    });
  }

  // For auth: find by email and include passwordHash
  async findByEmailWithPassword(email: string) {
    return await prisma.storeOwner.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        isActive: true,
        storeId: true,
      },
    });
  }

  async setLastLogin(id: string, date: Date) {
    return await prisma.storeOwner.update({
      where: { id },
      data: { lastLoginAt: date },
    });
  }
}
