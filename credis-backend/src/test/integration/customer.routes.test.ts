import { describe, test, expect, beforeEach } from '@jest/globals';
import { prisma, app, createTestStore } from './setup.js';
import type { Customer } from '@prisma/client';

describe('Customer Routes Integration Tests', () => {
  let testStoreId: string;

  beforeEach(async () => {
    // Create a test store for each test
    const testStore = await createTestStore();
    testStoreId = testStore.id;
  });

  describe('POST /api/customers', () => {
    test('should create a new customer successfully', async () => {
      const customerData = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        storeId: testStoreId,
      };

      const req = new Request('http://localhost/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        success: true,
        message: 'Customer created successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          name: customerData.name,
          phoneNumber: customerData.phoneNumber,
          storeId: customerData.storeId,
          createdAt: expect.any(String),
          modifiedAt: expect.any(String),
        }),
      });

      // Verify customer was actually created in database
      const dbCustomer = await prisma.customer.findUnique({
        where: { id: responseData.data.id },
      });
      expect(dbCustomer).toBeTruthy();
      expect(dbCustomer?.name).toBe(customerData.name);
    });

    test('should fail to create customer with invalid data', async () => {
      const invalidCustomerData = {
        name: '', // Invalid: empty name
        phoneNumber: 'invalid-phone',
        storeId: testStoreId,
      };

      const req = new Request('http://localhost/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidCustomerData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toMatchObject({
        success: false,
        message: expect.any(String),
      });

      // Verify customer was not created in database
      const dbCustomers = await prisma.customer.findMany();
      expect(dbCustomers).toHaveLength(0);
    });

    test('should fail to create customer with non-existent store', async () => {
      const customerData = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        storeId: '123e4567-e89b-12d3-a456-426614174000', // Non-existent store ID
      };

      const req = new Request('http://localhost/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toMatchObject({
        success: false,
        message: expect.any(String),
      });
    });

    test('should fail to create customer without required fields', async () => {
      const incompleteData = {
        name: 'John Doe',
        // Missing phoneNumber and storeId
      };

      const req = new Request('http://localhost/api/customers', {
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

  describe('GET /api/customers/:id', () => {
    let testCustomer: Customer;

    beforeEach(async () => {
      // Create a test customer for GET tests
      testCustomer = await prisma.customer.create({
        data: {
          name: 'Jane Doe',
          phoneNumber: '+1987654321',
          storeId: testStoreId,
        },
      });
    });

    test('should get customer by ID successfully', async () => {
      const req = new Request(`http://localhost/api/customers/${testCustomer.id}`, {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: testCustomer.id,
          name: testCustomer.name,
          phoneNumber: testCustomer.phoneNumber,
          storeId: testCustomer.storeId,
          createdAt: expect.any(String),
          modifiedAt: expect.any(String),
        }),
      });
    });

    test('should return 404 for non-existent customer', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const req = new Request(`http://localhost/api/customers/${nonExistentId}`, {
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

    test('should return 404 for invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';

      const req = new Request(`http://localhost/api/customers/${invalidId}`, {
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

  describe('GET /api/customers', () => {
    test('should get all customers when none exist', async () => {
      const req = new Request('http://localhost/api/customers', {
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

    test('should get all customers when some exist', async () => {
      // Create multiple test customers
      const customers = await Promise.all([
        prisma.customer.create({
          data: {
            name: 'Customer 1',
            phoneNumber: '+1111111111',
            storeId: testStoreId,
          },
        }),
        prisma.customer.create({
          data: {
            name: 'Customer 2',
            phoneNumber: '+2222222222',
            storeId: testStoreId,
          },
        }),
        prisma.customer.create({
          data: {
            name: 'Customer 3',
            phoneNumber: '+3333333333',
            storeId: testStoreId,
          },
        }),
      ]);

      const req = new Request('http://localhost/api/customers', {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'Customer 1' }),
          expect.objectContaining({ name: 'Customer 2' }),
          expect.objectContaining({ name: 'Customer 3' }),
        ]),
      });

      expect(responseData.data).toHaveLength(3);
    });
  });

  describe('API Error Handling', () => {
    test('should handle malformed JSON in POST request', async () => {
      const req = new Request('http://localhost/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toMatchObject({
        success: false,
        message: expect.any(String),
      });
    });

    test('should handle missing Content-Type header', async () => {
      const customerData = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        storeId: testStoreId,
      };

      const req = new Request('http://localhost/api/customers', {
        method: 'POST',
        body: JSON.stringify(customerData), // No Content-Type header
      });

      const response = await app.fetch(req);

      // Should still work or return appropriate error
      expect([200, 201, 400]).toContain(response.status);
    });
  });
});
