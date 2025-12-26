import { prisma } from "../../lib/prisma.js";
export class CreditRepository {
    async create(data) {
        return await prisma.credit.create({
            data: {
                customer: {
                    connect: {
                        id: data.customer_id,
                    },
                },
                store: {
                    connect: {
                        id: data.store_id,
                    },
                },
                amount: data.amount,
                transactionType: data.transaction_type,
                itemsDescription: data.items_description,
                journalNumber: data.journal_number,
                ...(data.created_by_owner_id && {
                    createdByOwner: {
                        connect: {
                            id: data.created_by_owner_id,
                        },
                    },
                }),
            },
        });
    }
    async findById(id) {
        return await prisma.credit.findUnique({
            where: { id },
            include: {
                customer: true,
                store: true,
            },
        });
    }
    async findAll() {
        return await prisma.credit.findMany({
            orderBy: { transactionDate: "desc" },
            include: {
                customer: true,
                store: true,
            },
        });
    }
    async findByCustomerId(customerId) {
        return await prisma.credit.findMany({
            where: { customerId },
            orderBy: { transactionDate: "desc" },
            include: {
                customer: true,
                store: true,
            },
        });
    }
    async findByStoreId(storeId) {
        return await prisma.credit.findMany({
            where: { storeId },
            orderBy: { transactionDate: "desc" },
            include: {
                customer: true,
                store: true,
            },
        });
    }
    async findByFilters(filters) {
        return await prisma.credit.findMany({
            where: {
                ...(filters.customer_id && { customerId: filters.customer_id }),
                ...(filters.store_id && { storeId: filters.store_id }),
                ...(filters.transaction_type && {
                    transactionType: filters.transaction_type,
                }),
                ...(filters.start_date && {
                    transactionDate: {
                        gte: filters.start_date,
                    },
                }),
                ...(filters.end_date && {
                    transactionDate: {
                        lte: filters.end_date,
                    },
                }),
                ...(filters.min_amount && {
                    amount: {
                        gte: filters.min_amount,
                    },
                }),
                ...(filters.max_amount && {
                    amount: {
                        lte: filters.max_amount,
                    },
                }),
            },
            orderBy: { transactionDate: "desc" },
            include: {
                customer: true,
                store: true,
            },
        });
    }
    async update(id, data) {
        return await prisma.credit.update({
            where: { id },
            data: {
                ...(data.amount !== undefined && { amount: data.amount }),
                ...(data.transaction_type && {
                    transactionType: data.transaction_type,
                }),
                ...(data.transaction_date && {
                    transactionDate: data.transaction_date,
                }),
                ...(data.items_description !== undefined && {
                    itemsDescription: data.items_description,
                }),
                ...(data.journal_number !== undefined && {
                    journalNumber: data.journal_number,
                }),
            },
        });
    }
    async delete(id) {
        return await prisma.credit.delete({
            where: { id },
        });
    }
    async getCustomerSummary(customerId, storeId) {
        const whereClause = {
            customerId,
            ...(storeId && { storeId }),
        };
        const transactions = await prisma.credit.findMany({
            where: whereClause,
            orderBy: { transactionDate: "desc" },
        });
        const creditGiven = transactions
            .filter((t) => t.transactionType === "credit_given")
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const paymentsReceived = transactions
            .filter((t) => t.transactionType === "payment_received")
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const outstandingBalance = creditGiven - paymentsReceived;
        const lastTransaction = transactions.length > 0 ? transactions[0].transactionDate : null;
        return {
            total_credit_given: creditGiven,
            total_payments_received: paymentsReceived,
            outstanding_balance: outstandingBalance,
            transaction_count: transactions.length,
            last_transaction_date: lastTransaction,
        };
    }
    async getStoreSummary(storeId) {
        const transactions = await prisma.credit.findMany({
            where: { storeId },
        });
        const creditGiven = transactions
            .filter((t) => t.transactionType === "credit_given")
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const paymentsReceived = transactions
            .filter((t) => t.transactionType === "payment_received")
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const uniqueCustomers = new Set(transactions.map((t) => t.customerId)).size;
        return {
            total_customers: uniqueCustomers,
            total_credit_given: creditGiven,
            total_payments_received: paymentsReceived,
            total_outstanding_balance: creditGiven - paymentsReceived,
            total_transactions: transactions.length,
        };
    }
    async getRecentTransactions(limit = 10, storeId) {
        return await prisma.credit.findMany({
            where: storeId ? { storeId } : undefined,
            orderBy: { transactionDate: "desc" },
            take: limit,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        email: true,
                    },
                },
                store: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async getTransactionsByDateRange(startDate, endDate, storeId) {
        return await prisma.credit.findMany({
            where: {
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
                ...(storeId && { storeId }),
            },
            orderBy: { transactionDate: "desc" },
            include: {
                customer: true,
                store: true,
            },
        });
    }
}
