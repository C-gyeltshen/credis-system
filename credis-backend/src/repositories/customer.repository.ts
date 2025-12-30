import { prisma } from "../../lib/prisma.js";
import type { CreateCustomerInput } from "../types/customer.types.js";

export class CustomerRepository {
  async create(data: CreateCustomerInput, storeId: string) {
    return await prisma.customer.create({
      data: {
        store: {
          connect: {
            id: storeId || data.storeId
          }
        },
        name: data.name,
        phoneNumber: data.phone_number,
      },
    });
  }
  async findById(id: string) {
    return await prisma.customer.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
  async findByPhoneNumber(storeId: string, phoneNumber: string) {
  return await prisma.customer.findUnique({
    where: {
      storeId_phoneNumber: {
        storeId,
        phoneNumber,
      },
    },
  });
}

}
