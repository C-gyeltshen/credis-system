import { CustomerRepository } from "../repositories/customer.repository.js";
import { CustomerBalanceRepository } from "../repositories/customerBalance.repository.js";
export class CustomerService {
    repository;
    balanceRepository;
    constructor() {
        this.repository = new CustomerRepository();
        this.balanceRepository = new CustomerBalanceRepository();
    }
    async createCustomer(data) {
        // Business logic: Check if customer already exists
        const existingCustomer = await this.repository.findByPhoneNumber(data.storeId, data.phone_number);
        if (existingCustomer) {
            throw new Error("Customer with this email already exists");
        }
        // Create customer
        const customer = await this.repository.create(data, data.storeId);
        return customer;
    }
    async getCustomer(id) {
        const customer = await this.repository.findById(id);
        if (!customer) {
            throw new Error("Customer not found");
        }
        return customer;
    }
    async getAllCustomers() {
        return await this.repository.findAll();
    }
    async getCustomersWithOverduePayments(days, storeId) {
        return await this.balanceRepository.findCustomersWithOverduePayments(days, storeId);
    }
}
