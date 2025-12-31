// Seed data for testing scenarios
import { TestFactories } from './test-factories.js';

export const seedData = {
  customers: [
    TestFactories.createCustomer({
      id: 'cust_001',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      phone: '+1111111111'
    }),
    TestFactories.createCustomer({
      id: 'cust_002', 
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      phone: '+2222222222'
    }),
    TestFactories.createCustomer({
      id: 'cust_003',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      phone: '+3333333333'
    })
  ],

  stores: [
    TestFactories.createStore({
      id: 'store_001',
      name: 'Electronics Plus',
      address: '100 Tech Street',
      ownerId: 'owner_001'
    }),
    TestFactories.createStore({
      id: 'store_002',
      name: 'Fashion Hub',
      address: '200 Style Avenue', 
      ownerId: 'owner_002'
    })
  ],

  credits: [
    TestFactories.createCredit({
      id: 'credit_001',
      customerId: 'cust_001',
      storeId: 'store_001',
      amount: 5000.00,
      balance: 3500.00,
      status: 'ACTIVE'
    }),
    TestFactories.createCredit({
      id: 'credit_002',
      customerId: 'cust_002',
      storeId: 'store_001',
      amount: 2000.00,
      balance: 0.00,
      status: 'PAID'
    }),
    TestFactories.createCredit({
      id: 'credit_003',
      customerId: 'cust_001',
      storeId: 'store_002',
      amount: 1500.00,
      balance: 1500.00,
      status: 'OVERDUE'
    })
  ],

  transactions: [
    TestFactories.createTransaction({
      id: 'trans_001',
      creditId: 'credit_001',
      type: 'PAYMENT',
      amount: 1500.00,
      description: 'Monthly payment'
    }),
    TestFactories.createTransaction({
      id: 'trans_002', 
      creditId: 'credit_002',
      type: 'PAYMENT',
      amount: 2000.00,
      description: 'Full payment'
    })
  ]
};

// Helper function to get clean seed data for each test
export const getCleanSeedData = () => JSON.parse(JSON.stringify(seedData));
