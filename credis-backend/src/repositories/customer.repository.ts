import { prisma } from "../../lib/prisma.js";
import type { CreateCustomerInput } from "../types/customer.types.js";

export class CustomerRepository {
  async create(data: CreateCustomerInput, storeId: string) {
    return await prisma.customer.create({
      data: {
        storeId: storeId,
        name: data.name,
        email: data.email,
        phoneNumber: data.phone_number,
        creditLimit: data.creditLimit || 0,
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.customer.findFirst({
      where: { email },
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
}
