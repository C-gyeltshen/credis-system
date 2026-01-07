import { prisma } from "../../lib/prisma.js";
import type { CreateStoreInput } from "../types/store.types.js";

export class StoreRepository {
  async create(data: CreateStoreInput) {
    return await prisma.store.create({
      data: {
        name: data.name
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
        ...(data.name && { name: data.name })
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
}
