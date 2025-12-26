import { prisma } from "../../lib/prisma.js";
export class StoreRepository {
    async create(data) {
        return await prisma.store.create({
            data: {
                name: data.name,
                phoneNumber: data.phone_number,
                address: data.address,
            },
        });
    }
    async findById(id) {
        return await prisma.store.findUnique({
            where: {
                id,
            },
        });
    }
    async findByPhoneNumber(phoneNumber) {
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
    async update(id, data) {
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
    async delete(id) {
        return await prisma.store.delete({
            where: {
                id,
            },
        });
    }
    async findWithCustomers(id) {
        return await prisma.store.findUnique({
            where: {
                id,
            },
            include: {
                customers: true,
            },
        });
    }
    async findWithOwners(id) {
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
