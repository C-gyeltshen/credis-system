// Mock database for testing
import { jest } from '@jest/globals';
export const mockPrismaClient = {
    customer: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    store: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    credit: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
    $transaction: jest.fn(),
};
// Helper function to reset all mocks
export const resetMockDatabase = () => {
    Object.values(mockPrismaClient).forEach(model => {
        if (typeof model === 'object' && model !== null) {
            Object.values(model).forEach(method => {
                if (typeof method === 'function' && 'mockReset' in method) {
                    method.mockReset();
                }
            });
        }
    });
};
