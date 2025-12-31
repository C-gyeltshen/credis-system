import { prisma } from "../../lib/prisma.js";

export class CustomerBalanceRepository {
  async upsertBalance({
    customerId,
    storeId,
    totalCreditGiven,
    totalPaymentsReceived,
    outstandingBalance,
    lastCreditDate,
    lastPaymentDate,
    lastTransactionDate,
  }: {
    customerId: string;
    storeId: string;
    totalCreditGiven: number;
    totalPaymentsReceived: number;
    outstandingBalance: number;
    lastCreditDate?: Date;
    lastPaymentDate?: Date;
    lastTransactionDate?: Date;
  }) {
    return await prisma.customerBalance.upsert({
      where: {
        customerId_storeId: {
          customerId,
          storeId,
        },
      },
      update: {
        totalCreditGiven,
        totalPaymentsReceived,
        outstandingBalance,
        lastCreditDate,
        lastPaymentDate,
        lastTransactionDate,
      },
      create: {
        customer: { connect: { id: customerId } },
        store: { connect: { id: storeId } },
        totalCreditGiven,
        totalPaymentsReceived,
        outstandingBalance,
        lastCreditDate,
        lastPaymentDate,
        lastTransactionDate,
      },
    });
  }
  async findCustomersWithOverduePayments(days: number, storeId: string) {
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - days);
    return await prisma.customerBalance.findMany({
      where: {
        storeId,
        OR: [
          { lastPaymentDate: { lt: overdueDate } },
          { lastPaymentDate: null },
        ],
      },
      include: {
        customer: true,
        store: true,
      },
    });
  }
}
