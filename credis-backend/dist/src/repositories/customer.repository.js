import { prisma } from "../../lib/prisma.js";
export class CustomerRepository {
    async create(data, storeId) {
        return await prisma.customer.create({
            data: {
                store: {
                    connect: {
                        id: storeId || data.storeId
                    }
                },
                name: data.name,
                email: data.email,
                phoneNumber: data.phone_number,
                creditLimit: data.creditLimit || 0,
            },
        });
    }
    async findByEmail(email) {
        return await prisma.customer.findFirst({
            where: { email },
        });
    }
    async findById(id) {
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
