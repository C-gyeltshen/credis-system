// This setup is for UNIT TESTS ONLY
// Integration tests have their own setup in src/test/integration/setup.ts
// Mock Prisma for unit tests - this ensures unit tests don't hit the database
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        customer: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        store: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        credit: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    })),
}));
// Global test setup for unit tests
beforeAll(async () => {
    console.log('🔧 Setting up unit test environment...');
});
afterAll(async () => {
    console.log('🧹 Cleaning up unit test environment...');
});
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    console.log('🧹 Mocks cleared for unit test');
});
afterEach(() => {
    // Additional cleanup after each test if needed
});
// Mock environment variables for unit testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/credis_test';
export {};
