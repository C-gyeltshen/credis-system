import { prisma } from "../../lib/prisma.js";
export class StoreRepository {
    async create(data) {
        return await prisma.store.create({
            data: {
                name: data.name
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
                ...(data.name && { name: data.name })
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
