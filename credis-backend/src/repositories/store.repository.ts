import { prisma } from "../../lib/prisma.js";
import type { CreateStoreInput } from "../types/store.types.js";

export class StoreRepository {
  async create(data: CreateStoreInput) {
    return await prisma.store.create({
      data: {
        name: data.name,
        phoneNumber: data.phone_number,
        address: data.address,
      },
    });
  }

  async findById(id: string) {
    return await prisma.store.findUnique({
      where: {
        id,
      },
    });
  }

  async findByPhoneNumber(phoneNumber: string) {
    return await prisma.store.findFirst({
      where: {
        phoneNumber,
      },
    });
  }

  async findAll() {
    return await prisma.store.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: string, data: Partial<CreateStoreInput>) {
    return await prisma.store.update({
      where: {
        id,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone_number && { phoneNumber: data.phone_number }),
        ...(data.address && { address: data.address }),
      },
    });
  }

  async delete(id: string) {
    return await prisma.store.delete({
      where: {
        id,
      },
    });
  }

  async findWithCustomers(id: string) {
    return await prisma.store.findUnique({
      where: {
        id,
      },
      include: {
        customers: true,
      },
    });
  }

  async findWithOwners(id: string) {
    return await prisma.store.findUnique({
      where: {
        id,
      },
      include: {
        storeOwners: true,
      },
    });
  }

  async findWithCustomersAndOwners(id: string) {
    return await prisma.store.findUnique({
      where: {
        id,
      },
      include: {
        customers: true,
        storeOwners: true,
      },
    });
  }
}
