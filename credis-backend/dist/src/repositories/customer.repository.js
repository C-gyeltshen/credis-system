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
                phoneNumber: data.phone_number,
            },
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
    async findByPhoneNumber(storeId, phoneNumber) {
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
