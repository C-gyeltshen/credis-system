import { CustomerRepository } from "../repositories/customer.repository.js";
import type { CreateCustomerInput } from "../types/customer.types.js";

export class CustomerService {
  private repository: CustomerRepository;

  constructor() {
    this.repository = new CustomerRepository();
  }

  async createCustomer(data: CreateCustomerInput) {
    // Business logic: Check if customer already exists
    const existingCustomer = await this.repository.findByEmail(data.email);
    
    if (existingCustomer) {
      throw new Error('Customer with this email already exists');
    }

    // Business logic: Validate credit limit
    if (data.creditLimit && data.creditLimit < 0) {
      throw new Error('Credit limit cannot be negative');
    }

    // Create customer
    const customer = await this.repository.create(data, data.storeId);
    
    return customer;
  }

  async getCustomer(id: string) {
    const customer = await this.repository.findById(id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  }

  async getAllCustomers() {
    return await this.repository.findAll();
  }
}