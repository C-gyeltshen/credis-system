import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { app } from '../../index.js';
// Real Prisma client for integration tests
const prisma = new PrismaClient();
// Export for use in integration tests
export { prisma, app };
// Setup test database for integration tests
beforeAll(async () => {
    console.log('🔧 Setting up integration test environment...');
    // Connect to the test database
    try {
        await prisma.$connect();
        console.log('✅ Connected to test database');
    }
    catch (error) {
        console.error('❌ Failed to connect to test database:', error);
        throw error;
    }
});
afterAll(async () => {
    console.log('🧹 Cleaning up integration test environment...');
    // Disconnect from the database
    try {
        await prisma.$disconnect();
        console.log('✅ Disconnected from test database');
    }
    catch (error) {
        console.error('❌ Failed to disconnect from test database:', error);
    }
});
beforeEach(async () => {
    // Clean the database before each test
    // Delete in order to respect foreign key constraints
    await prisma.credit.deleteMany();
    await prisma.customerBalance.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.store.deleteMany();
    await prisma.storeOwner.deleteMany();
    console.log('🧹 Database cleaned for test');
});
afterEach(async () => {
    // Additional cleanup if needed
});
// Helper function to create test data
export const createTestStore = async () => {
    return await prisma.store.create({
        data: {
            name: 'Test Store',
            address: '123 Test Street',
            phoneNumber: '+1234567890',
        },
    });
};
export const createTestCustomer = async (storeId) => {
    const testStoreId = storeId || (await createTestStore()).id;
    return await prisma.customer.create({
        data: {
            name: 'Test Customer',
            phoneNumber: '+1987654321',
            storeId: testStoreId,
        },
    });
};
export const createTestStoreOwner = async (storeId) => {
    const testStoreId = storeId || (await createTestStore()).id;
    return await prisma.storeOwner.create({
        data: {
            name: 'Test Store Owner',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            storeId: testStoreId,
        },
    });
};
