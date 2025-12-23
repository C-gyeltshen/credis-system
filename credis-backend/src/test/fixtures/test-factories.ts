// Test data factories for generating mock data
export class TestFactories {
  static createCustomer(overrides: any = {}) {
    return {
      id: 'cust_123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      ...overrides
    };
  }

  static createStore(overrides: any = {}) {
    return {
      id: 'store_123',
      name: 'Test Store',
      address: '456 Business Ave',
      phone: '+0987654321',
      email: 'store@example.com',
      ownerId: 'owner_123',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      ...overrides
    };
  }

  static createCredit(overrides: any = {}) {
    return {
      id: 'credit_123',
      customerId: 'cust_123',
      storeId: 'store_123',
      amount: 1000.00,
      balance: 1000.00,
      interestRate: 0.05,
      status: 'ACTIVE',
      dueDate: new Date('2024-01-01'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      ...overrides
    };
  }

  static createTransaction(overrides: any = {}) {
    return {
      id: 'trans_123',
      creditId: 'credit_123',
      type: 'PAYMENT',
      amount: 100.00,
      description: 'Payment received',
      createdAt: new Date('2023-01-01'),
      ...overrides
    };
  }

  // Create multiple instances
  static createMultipleCustomers(count: number) {
    return Array.from({ length: count }, (_, index) => 
      this.createCustomer({ 
        id: `cust_${index + 1}`,
        email: `customer${index + 1}@example.com`
      })
    );
  }

  static createMultipleStores(count: number) {
    return Array.from({ length: count }, (_, index) => 
      this.createStore({ 
        id: `store_${index + 1}`,
        name: `Store ${index + 1}`,
        email: `store${index + 1}@example.com`
      })
    );
  }
}
