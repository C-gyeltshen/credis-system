# Integration Tests

This directory contains integration tests for the credis-backend API. Integration tests verify that different parts of the application work together correctly, including the interaction between controllers, services, repositories, and the database.

## Overview

Integration tests differ from unit tests in that they:
- Test complete request/response cycles through the API
- Use a real database connection (test database)
- Verify data persistence and retrieval
- Test middleware and validation layers
- Check error handling across multiple components

## Setup

### Test Database
Integration tests require a test PostgreSQL database. The setup is configured to:
- Connect to a test database using the `DATABASE_URL` environment variable
- Clean the database before each test to ensure isolation
- Create test data using helper functions

### Test Structure
```
src/test/integration/
├── setup.ts              # Test environment setup and helpers
├── customer.routes.test.ts # Customer API integration tests
├── store.routes.test.ts    # Store API integration tests
├── credit.routes.test.ts   # Credit API integration tests
└── README.md              # This file
```

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration -- --watch

# Run specific integration test file
npm run test:integration -- customer.routes.test.ts

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### setup.ts
Contains:
- Database connection setup and teardown
- Database cleaning between tests
- Helper functions for creating test data
- Exports the Hono app instance for testing

### Test Files
Each test file follows this pattern:
1. Import necessary dependencies and test setup
2. Set up test data in `beforeEach` hooks
3. Test successful operations (happy path)
4. Test error conditions (validation, not found, etc.)
5. Verify database state after operations

## Test Patterns

### Making Requests
Tests use the native Hono testing approach with `app.fetch()`:

```typescript
const req = new Request('http://localhost/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

const response = await app.fetch(req);
const responseData = await response.json();
```

### Database Verification
After API operations, tests verify the database state:

```typescript
// Verify data was created
const dbRecord = await prisma.customer.findUnique({
  where: { id: responseData.data.id },
});
expect(dbRecord).toBeTruthy();
```

### Test Data Creation
Helper functions in `setup.ts` provide consistent test data:

```typescript
const testStore = await createTestStore();
const testCustomer = await createTestCustomer(testStore.id);
```

## What's Tested

### Customer Routes (`/api/customers`)
- ✅ Create customer with valid data
- ✅ Get customer by ID
- ✅ Get all customers
- ✅ Validation error handling
- ✅ Not found error handling

### Store Routes (`/api/stores`)
- ✅ Create store with valid data
- ✅ Get store by ID
- ✅ Get all stores
- ✅ Validation error handling
- ✅ Not found error handling

### Credit Routes (`/api/credits`)
- ✅ Create credit transaction
- ✅ Get credit by ID
- ✅ Get all credits
- ✅ Get credits by customer ID
- ✅ Validation error handling
- ✅ Foreign key constraint testing

## Environment Requirements

1. **Test Database**: A PostgreSQL database for testing
2. **Environment Variables**: 
   - `NODE_ENV=test`
   - `DATABASE_URL` pointing to test database
3. **Dependencies**: All production dependencies plus test dependencies

## Best Practices

1. **Test Isolation**: Each test cleans the database beforehand
2. **Real Dependencies**: Uses actual database, not mocks
3. **Comprehensive Coverage**: Tests both success and failure scenarios
4. **Data Verification**: Always verify database state after operations
5. **Consistent Test Data**: Use helper functions for consistent test setup

## Debugging Tests

To debug failing integration tests:

1. Check database connection and credentials
2. Verify test database is accessible
3. Check for schema mismatches
4. Review foreign key constraints
5. Use `console.log` in tests to inspect responses
6. Run tests individually to isolate issues

## Next Steps

Consider adding:
- Authentication/authorization testing
- File upload testing (for payment screenshots)
- Rate limiting tests
- Database transaction rollback tests
- Performance testing for large datasets
