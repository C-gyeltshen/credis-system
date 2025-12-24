import { describe, test, expect, beforeEach } from '@jest/globals';
import { prisma, app } from './setup.js';
import type { Store } from '@prisma/client';

describe('Store Routes Integration Tests', () => {
  describe('GET /api/stores', () => {
    test('should get all stores when none exist', async () => {
      const req = new Request('http://localhost/api/stores', {
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

    test('should get all stores when some exist', async () => {
      // Create multiple test stores
      const stores = await Promise.all([
        prisma.store.create({
          data: {
            name: 'Store 1',
            address: '123 First Street',
            phoneNumber: '+1111111111',
          },
        }),
        prisma.store.create({
          data: {
            name: 'Store 2',
            address: '456 Second Street',
            phoneNumber: '+2222222222',
          },
        }),
        prisma.store.create({
          data: {
            name: 'Store 3',
            address: '789 Third Street',
            phoneNumber: '+3333333333',
          },
        }),
      ]);

      const req = new Request('http://localhost/api/stores', {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'Store 1' }),
          expect.objectContaining({ name: 'Store 2' }),
          expect.objectContaining({ name: 'Store 3' }),
        ]),
      });

      expect(responseData.data).toHaveLength(3);
    });
  });

  describe('POST /api/stores', () => {
    test('should create a new store successfully', async () => {
      const storeData = {
        name: 'New Test Store',
        address: '123 Test Avenue',
        phoneNumber: '+1234567890',
      };

      const req = new Request('http://localhost/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toMatchObject({
        success: true,
        message: 'Store created successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          name: storeData.name,
          address: storeData.address,
          phoneNumber: storeData.phoneNumber,
          createdAt: expect.any(String),
          modifiedAt: expect.any(String),
        }),
      });

      // Verify store was actually created in database
      const dbStore = await prisma.store.findUnique({
        where: { id: responseData.data.id },
      });
      expect(dbStore).toBeTruthy();
      expect(dbStore?.name).toBe(storeData.name);
    });

    test('should fail to create store with invalid data', async () => {
      const invalidStoreData = {
        name: '', // Invalid: empty name
        address: 'Some address',
        phoneNumber: 'invalid-phone',
      };

      const req = new Request('http://localhost/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidStoreData),
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toMatchObject({
        success: false,
        message: expect.any(String),
      });

      // Verify store was not created in database
      const dbStores = await prisma.store.findMany();
      expect(dbStores).toHaveLength(0);
    });
  });

  describe('GET /api/stores/:id', () => {
    let testStore: Store;

    beforeEach(async () => {
      // Create a test store for GET tests
      testStore = await prisma.store.create({
        data: {
          name: 'Test Store',
          address: '123 Test Street',
          phoneNumber: '+1987654321',
        },
      });
    });

    test('should get store by ID successfully', async () => {
      const req = new Request(`http://localhost/api/stores/${testStore.id}`, {
        method: 'GET',
      });

      const response = await app.fetch(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: testStore.id,
          name: testStore.name,
          address: testStore.address,
          phoneNumber: testStore.phoneNumber,
          createdAt: expect.any(String),
          modifiedAt: expect.any(String),
        }),
      });
    });

    test('should return 404 for non-existent store', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const req = new Request(`http://localhost/api/stores/${nonExistentId}`, {
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
});
