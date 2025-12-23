import { describe, test, expect, beforeEach } from '@jest/globals';
import { prisma, app, createTestStore, createTestCustomer } from './setup.js';
import type { Credit, Customer, Store } from '@prisma/client';

describe('Credit Routes Integration Tests', () => {
  let testStore: Store;
  let testCustomer: Customer;

  beforeEach(async () => {
    // Create test store and customer for each test
    testStore = await createTestStore();
    testCustomer = await createTestCustomer(testStore.id);
  });

  describe('POST /api/credits', () => {
    test('should create a new credit successfully', async () => {
      const creditData = {
        customerId: testCustomer.id,
        amount: 100.50,
        itemsDescription: 'Test credit transaction',
        transactionType: 'credit_given',
      };

      const req = new Request('http://localhost/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        success: true,
        message: 'Credit created successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          customerId: creditData.customerId,
          amount: creditData.amount,
          itemsDescription: creditData.itemsDescription,
          transactionType: creditData.transactionType,
          createdAt: expect.any(String),
          modifiedAt: expect.any(String),
        }),
      });

      // Verify credit was actually created in database
      const dbCredit = await prisma.credit.findUnique({
        where: { id: responseData.data.id },
      });
      expect(dbCredit).toBeTruthy();
      expect(Number(dbCredit?.amount)).toBe(creditData.amount);
    });

    test('should fail to create credit with invalid customer ID', async () => {
      const creditData = {
        customerId: '123e4567-e89b-12d3-a456-426614174000', // Non-existent customer
        amount: 100.50,
        itemsDescription: 'Test credit transaction',
        transactionType: 'credit_given',
      };

      const req = new Request('http://localhost/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toMatchObject({
        success: false,
        message: expect.any(String),
      });

      // Verify credit was not created in database
      const dbCredits = await prisma.credit.findMany();
      expect(dbCredits).toHaveLength(0);
    });

    test('should fail to create credit with invalid amount', async () => {
      const creditData = {
        customerId: testCustomer.id,
        amount: -100, // Invalid: negative amount
        itemsDescription: 'Test credit transaction',
        transactionType: 'credit_given',
      };

      const req = new Request('http://localhost/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toMatchObject({
        success: false,
        message: expect.any(String),
      });
    });

    test('should fail to create credit without required fields', async () => {
      const incompleteData = {
        customerId: testCustomer.id,
        // Missing amount and itemsDescription
      };

      const req = new Request('http://localhost/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toMatchObject({
        success: false,
        message: expect.any(String),
      });
    });
  });

  describe('GET /api/credits', () => {
    test('should get all credits when none exist', async () => {
      const req = new Request('http://localhost/api/credits', {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: [],
      });
    });

    test('should get all credits when some exist', async () => {
      // Create multiple test credits
      const credits = await Promise.all([
        prisma.credit.create({
          data: {
            customerId: testCustomer.id,
            storeId: testStore.id,
            amount: 100,
            itemsDescription: 'Credit 1',
            transactionType: 'credit_given',
          },
        }),
        prisma.credit.create({
          data: {
            customerId: testCustomer.id,
            storeId: testStore.id,
            amount: 200,
            itemsDescription: 'Credit 2',
            transactionType: 'credit_given',
          },
        }),
        prisma.credit.create({
          data: {
            customerId: testCustomer.id,
            storeId: testStore.id,
            amount: 300,
            itemsDescription: 'Payment 1',
            transactionType: 'payment_received',
          },
        }),
      ]);

      const req = new Request('http://localhost/api/credits', {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ itemsDescription: 'Credit 1', amount: expect.any(Number) }),
          expect.objectContaining({ itemsDescription: 'Credit 2', amount: expect.any(Number) }),
          expect.objectContaining({ itemsDescription: 'Payment 1', amount: expect.any(Number) }),
        ]),
      });

      expect(responseData.data).toHaveLength(3);
    });
  });

  describe('GET /api/credits/:id', () => {
    let testCredit: Credit;

    beforeEach(async () => {
      // Create a test credit for GET tests
      testCredit = await prisma.credit.create({
        data: {
          customerId: testCustomer.id,
          storeId: testStore.id,
          amount: 150.75,
          itemsDescription: 'Test credit for GET',
          transactionType: 'credit_given',
        },
      });
    });

    test('should get credit by ID successfully', async () => {
      const req = new Request(`http://localhost/api/credits/${testCredit.id}`, {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: testCredit.id,
          customerId: testCredit.customerId,
          amount: expect.any(Number),
          itemsDescription: testCredit.itemsDescription,
          transactionType: testCredit.transactionType,
          createdAt: expect.any(String),
          modifiedAt: expect.any(String),
        }),
      });
    });

    test('should return 404 for non-existent credit', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const req = new Request(`http://localhost/api/credits/${nonExistentId}`, {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData).toMatchObject({
        success: false,
        message: expect.any(String),
      });
    });
  });

  describe('GET /api/credits/customer/:customerId', () => {
    beforeEach(async () => {
      // Create multiple credits for the test customer
      await Promise.all([
        prisma.credit.create({
          data: {
            customerId: testCustomer.id,
            storeId: testStore.id,
            amount: 100,
            itemsDescription: 'Customer Credit 1',
            transactionType: 'credit_given',
          },
        }),
        prisma.credit.create({
          data: {
            customerId: testCustomer.id,
            storeId: testStore.id,
            amount: 200,
            itemsDescription: 'Customer Payment 1',
            transactionType: 'payment_received',
          },
        }),
      ]);
    });

    test('should get all credits for a customer', async () => {
      const req = new Request(`http://localhost/api/credits/customer/${testCustomer.id}`, {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ 
            customerId: testCustomer.id,
            itemsDescription: 'Customer Credit 1',
          }),
          expect.objectContaining({ 
            customerId: testCustomer.id,
            itemsDescription: 'Customer Payment 1',
          }),
        ]),
      });

      expect(responseData.data).toHaveLength(2);
    });

    test('should return empty array for customer with no credits', async () => {
      // Create another customer with no credits
      const anotherCustomer = await createTestCustomer(testStore.id);

      const req = new Request(`http://localhost/api/credits/customer/${anotherCustomer.id}`, {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: [],
      });
    });
  });
});
