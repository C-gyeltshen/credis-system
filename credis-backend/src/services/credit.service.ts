import { CreditRepository } from "../repositories/credit.repository.js";
import { CustomerRepository } from "../repositories/customer.repository.js";
import { StoreRepository } from "../repositories/store.repository.js";
import { CustomerBalanceRepository } from "../repositories/customerBalance.repository.js";
import type {
  CreateCreditInput,
  UpdateCreditInput,
  CreditTransactionFilters,
} from "../types/credit.types.js";

export class CreditService {
  private repository: CreditRepository;
  private customerRepository: CustomerRepository;
  private storeRepository: StoreRepository;
  private customerBalanceRepository: CustomerBalanceRepository;

  constructor() {
    this.repository = new CreditRepository();
    this.customerRepository = new CustomerRepository();
    this.storeRepository = new StoreRepository();
    this.customerBalanceRepository = new CustomerBalanceRepository();
  }

  async createCredit(data: CreateCreditInput) {
    // Business logic: Validate customer exists
    const customer = await this.customerRepository.findById(data.customer_id);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // Business logic: Validate store exists
    const store = await this.storeRepository.findById(data.store_id);
    if (!store) {
      throw new Error("Store not found");
    }

    // Business logic: Validate customer belongs to store
    if (customer.storeId !== data.store_id) {
      throw new Error("Customer does not belong to this store");
    }

    // Business logic: Validate amount is positive
    if (data.amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    // Business logic: Check if customer is active
    if (!customer.isActive) {
      throw new Error("Cannot create credit transaction for inactive customer");
    }

    // Business logic: For credit_given, check if it exceeds credit limit
    if (data.transaction_type === "credit_given" && customer.creditLimit) {
      const currentBalance = await this.repository.getCustomerSummary(
        data.customer_id,
        data.store_id
      );
      const newBalance = currentBalance.outstanding_balance + data.amount;

      if (newBalance > Number(customer.creditLimit)) {
        throw new Error(
          `Credit limit exceeded. Current balance: ${currentBalance.outstanding_balance}, Credit limit: ${customer.creditLimit}`
        );
      }
    }

    // Create credit transaction
    const credit = await this.repository.create(data);

    // After creating credit, recalculate and upsert CustomerBalance
    const credits = await this.repository.findByCustomerId(data.customer_id);
    let totalCreditGiven = 0;
    let totalPaymentsReceived = 0;
    let lastCreditDate: Date | undefined = undefined;
    let lastPaymentDate: Date | undefined = undefined;
    let lastTransactionDate: Date | undefined = undefined;

    for (const tx of credits) {
      if (tx.transactionType === "credit_given") {
        totalCreditGiven += Number(tx.amount);
        if (!lastCreditDate || tx.transactionDate > lastCreditDate) {
          lastCreditDate = tx.transactionDate;
        }
      } else if (tx.transactionType === "payment_received") {
        totalPaymentsReceived += Number(tx.amount);
        if (!lastPaymentDate || tx.transactionDate > lastPaymentDate) {
          lastPaymentDate = tx.transactionDate;
        }
      }
      if (!lastTransactionDate || tx.transactionDate > lastTransactionDate) {
        lastTransactionDate = tx.transactionDate;
      }
    }
    const outstandingBalance = totalCreditGiven - totalPaymentsReceived;
    await this.customerBalanceRepository.upsertBalance({
      customerId: data.customer_id,
      storeId: data.store_id,
      totalCreditGiven,
      totalPaymentsReceived,
      outstandingBalance,
      lastCreditDate,
      lastPaymentDate,
      lastTransactionDate,
    });

    return credit;
  }

  async getCredit(id: string) {
    const credit = await this.repository.findById(id);

    if (!credit) {
      throw new Error("Credit transaction not found");
    }

    return credit;
  }

  async getAllCredits() {
    return await this.repository.findAll();
  }

  async getCustomerCredits(customerId: string) {
    // Validate customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    return await this.repository.findByCustomerId(customerId);
  }

  async getStoreCredits(storeId: string) {
    // Validate store exists
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    return await this.repository.findByStoreId(storeId);
  }

  async getCreditsByFilters(filters: CreditTransactionFilters) {
    // Validate customer if provided
    if (filters.customer_id) {
      const customer = await this.customerRepository.findById(
        filters.customer_id
      );
      if (!customer) {
        throw new Error("Customer not found");
      }
    }

    // Validate store if provided
    if (filters.store_id) {
      const store = await this.storeRepository.findById(filters.store_id);
      if (!store) {
        throw new Error("Store not found");
      }
    }

    // Business logic: Validate date range
    if (filters.start_date && filters.end_date) {
      if (filters.start_date > filters.end_date) {
        throw new Error("Start date must be before end date");
      }
    }

    // Business logic: Validate amount range
    if (filters.min_amount !== undefined && filters.min_amount < 0) {
      throw new Error("Minimum amount cannot be negative");
    }

    if (filters.max_amount !== undefined && filters.max_amount < 0) {
      throw new Error("Maximum amount cannot be negative");
    }

    if (
      filters.min_amount !== undefined &&
      filters.max_amount !== undefined &&
      filters.min_amount > filters.max_amount
    ) {
      throw new Error("Minimum amount must be less than maximum amount");
    }

    return await this.repository.findByFilters(filters);
  }

  async updateCredit(id: string, data: UpdateCreditInput) {
    // Check if credit exists
    const existingCredit = await this.repository.findById(id);

    if (!existingCredit) {
      throw new Error("Credit transaction not found");
    }

    // Business logic: Validate amount is positive if provided
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    // Business logic: If changing amount or transaction type, validate credit limit
    if (
      (data.amount !== undefined || data.transaction_type !== undefined) &&
      existingCredit.customer
    ) {
      const newTransactionType =
        data.transaction_type || existingCredit.transactionType;
      const newAmount = data.amount || Number(existingCredit.amount);

      if (
        newTransactionType === "credit_given" &&
        existingCredit.customer.creditLimit
      ) {
        // Calculate balance without this transaction
        const currentSummary = await this.repository.getCustomerSummary(
          existingCredit.customerId,
          existingCredit.storeId
        );

        // Adjust for removing old transaction and adding new one
        let adjustedBalance = currentSummary.outstanding_balance;

        if (existingCredit.transactionType === "credit_given") {
          adjustedBalance -= Number(existingCredit.amount);
        } else {
          adjustedBalance += Number(existingCredit.amount);
        }

        if (newTransactionType === "credit_given") {
          adjustedBalance += newAmount;
        } else {
          adjustedBalance -= newAmount;
        }

        if (adjustedBalance > Number(existingCredit.customer.creditLimit)) {
          throw new Error(
            `Updated transaction would exceed credit limit. Credit limit: ${existingCredit.customer.creditLimit}`
          );
        }
      }
    }

    // Update credit transaction
    const updatedCredit = await this.repository.update(id, data);

    return updatedCredit;
  }

  async deleteCredit(id: string) {
    // Check if credit exists
    const existingCredit = await this.repository.findById(id);

    if (!existingCredit) {
      throw new Error("Credit transaction not found");
    }

    // Delete credit transaction
    await this.repository.delete(id);

    return { message: "Credit transaction deleted successfully" };
  }

  async getCustomerSummary(customerId: string, storeId?: string) {
    // Validate customer exists
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // Validate store if provided
    if (storeId) {
      const store = await this.storeRepository.findById(storeId);
      if (!store) {
        throw new Error("Store not found");
      }

      // Validate customer belongs to store
      if (customer.storeId !== storeId) {
        throw new Error("Customer does not belong to this store");
      }
    }

    return await this.repository.getCustomerSummary(customerId, storeId);
  }

  async getStoreSummary(storeId: string) {
    // Validate store exists
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    return await this.repository.getStoreSummary(storeId);
  }

  async getRecentTransactions(limit: number = 10, storeId?: string) {
    // Business logic: Validate limit
    if (limit <= 0) {
      throw new Error("Limit must be greater than zero");
    }

    if (limit > 100) {
      throw new Error("Limit cannot exceed 100");
    }

    // Validate store if provided
    if (storeId) {
      const store = await this.storeRepository.findById(storeId);
      if (!store) {
        throw new Error("Store not found");
      }
    }

    return await this.repository.getRecentTransactions(limit, storeId);
  }

  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    storeId?: string
  ) {
    // Business logic: Validate date range
    if (startDate > endDate) {
      throw new Error("Start date must be before end date");
    }

    // Business logic: Prevent excessive date ranges
    const daysDiff =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      throw new Error("Date range cannot exceed 365 days");
    }

    // Validate store if provided
    if (storeId) {
      const store = await this.storeRepository.findById(storeId);
      if (!store) {
        throw new Error("Store not found");
      }
    }

    return await this.repository.getTransactionsByDateRange(
      startDate,
      endDate,
      storeId
    );
  }

  async getCustomersWithOutstandingBalance(storeId: string, limit?: number) {
    // Validate store exists
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    const transactions = await this.repository.findByStoreId(storeId);

    // Group by customer and calculate outstanding balance
    const customerBalances = new Map<
      string,
      {
        customerId: string;
        customerName: string;
        customerPhone: string;
        totalCreditGiven: number;
        totalPaymentsReceived: number;
        outstandingBalance: number;
      }
    >();

    for (const transaction of transactions) {
      const customerId = transaction.customerId;
      const existing = customerBalances.get(customerId);

      const creditGiven =
        transaction.transactionType === "credit_given"
          ? Number(transaction.amount)
          : 0;
      const paymentsReceived =
        transaction.transactionType === "payment_received"
          ? Number(transaction.amount)
          : 0;

      if (existing) {
        existing.totalCreditGiven += creditGiven;
        existing.totalPaymentsReceived += paymentsReceived;
        existing.outstandingBalance =
          existing.totalCreditGiven - existing.totalPaymentsReceived;
      } else {
        customerBalances.set(customerId, {
          customerId,
          customerName: transaction.customer.name,
          customerPhone: transaction.customer.phoneNumber,
          totalCreditGiven: creditGiven,
          totalPaymentsReceived: paymentsReceived,
          outstandingBalance: creditGiven - paymentsReceived,
        });
      }
    }

    // Filter only customers with outstanding balance > 0, sort, and apply limit if provided
    let result = Array.from(customerBalances.values())
      .filter((balance) => balance.outstandingBalance > 0)
      .sort((a, b) => b.outstandingBalance - a.outstandingBalance);
    if (limit !== undefined) {
      result = result.slice(0, limit);
    }
    return result;
  }
}
