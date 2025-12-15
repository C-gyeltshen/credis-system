# Complete Guide: Building a POST Customer Endpoint

## Understanding the Folder Structure

The folder structure follows a **layered architecture** where each layer has a specific responsibility:

```
Request Flow:
Client → Routes → Middleware → Controller → Service → Repository → Database
                                     ↓
                                 Response
```

### Layer Responsibilities:

2. **Middleware** - Validate requests, authenticate users
3. **Controller** - Handle HTTP request/response
4. **Service** - Business logic and rules
5. **Repository** - Database operations (Prisma)
6. **Types** - TypeScript interfaces
8. **Utils** - Helper functions

---

## Step-by-Step Implementation

### Step 1: Define Prisma Schema

**File: `prisma/schema.prisma`**

```prisma
model Customer {
  id          String   @id @default(uuid())
  name        String
  email       String   @unique
  phone       String
  address     String?
  creditLimit Decimal  @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("customers")
}
```

Run migration:
```bash
npx prisma migrate dev --name add_customer
```

---

### Step 2: Create TypeScript Types

**File: `src/types/customer.types.ts`**

```typescript
export interface CreateCustomerInput {
  name: string;
  email: string;
  phone: string;
  address?: string;
  creditLimit?: number;
}

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  creditLimit: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Step 3: Create Validator

**File: `src/validators/customer.validator.ts`**

```typescript
import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  address: z.string().optional(),
  creditLimit: z.number().min(0).optional().default(0)
});

export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;
```

Install Zod:
```bash
npm install zod @hono/zod-validator
```

---

### Step 4: Create Repository

**File: `src/repositories/customer.repository.ts`**

```typescript
import { prisma } from '../../lib/prisma';
import { CreateCustomerInput } from '../types/customer.types';

export class CustomerRepository {
  async create(data: CreateCustomerInput) {
    return await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        creditLimit: data.creditLimit || 0
      }
    });
  }

  async findByEmail(email: string) {
    return await prisma.customer.findUnique({
      where: { email }
    });
  }

  async findById(id: string) {
    return await prisma.customer.findUnique({
      where: { id }
    });
  }

  async findAll() {
    return await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
```

**Why Repository?** Separates database logic from business logic, making it easy to change databases later.

---

### Step 5: Create Service

**File: `src/services/customer.service.ts`**

```typescript
import { CustomerRepository } from '../repositories/customer.repository';
import { CreateCustomerInput } from '../types/customer.types';

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
    const customer = await this.repository.create(data);
    
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
```

**Why Service?** Contains business logic like validation rules, duplicate checking, and calculations.

---

### Step 6: Create Controller

**File: `src/controllers/customer.controller.ts`**

```typescript
import { Context } from 'hono';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerInput } from '../types/customer.types';

export class CustomerController {
  private service: CustomerService;

  constructor() {
    this.service = new CustomerService();
  }

  createCustomer = async (c: Context) => {
    try {
      const body = await c.req.json<CreateCustomerInput>();
      
      const customer = await this.service.createCustomer(body);
      
      return c.json({
        success: true,
        message: 'Customer created successfully',
        data: customer
      }, 201);
      
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message || 'Failed to create customer'
      }, 400);
    }
  };

  getCustomer = async (c: Context) => {
    try {
      const id = c.req.param('id');
      const customer = await this.service.getCustomer(id);
      
      return c.json({
        success: true,
        data: customer
      }, 200);
      
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message
      }, 404);
    }
  };

  getAllCustomers = async (c: Context) => {
    try {
      const customers = await this.service.getAllCustomers();
      
      return c.json({
        success: true,
        data: customers
      }, 200);
      
    } catch (error: any) {
      return c.json({
        success: false,
        message: error.message
      }, 500);
    }
  };
}
```

**Why Controller?** Handles HTTP-specific concerns (request/response) and delegates work to services.

---

### Step 7: Create Validation Middleware

**File: `src/middlewares/validation.ts`**

```typescript
import { Context, Next } from 'hono';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);
      
      // Attach validated data to context
      c.set('validatedData', validated);
      
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, 400);
      }
      
      return c.json({
        success: false,
        message: 'Invalid request'
      }, 400);
    }
  };
};
```

---

### Step 8: Create Routes

**File: `src/routes/customer.routes.ts`**

```typescript
import { Hono } from 'hono';
import { CustomerController } from '../controllers/customer.controller';
import { validate } from '../middlewares/validation';
import { createCustomerSchema } from '../validators/customer.validator';

const customerRoutes = new Hono();
const controller = new CustomerController();

// POST /api/customers - Create new customer
customerRoutes.post(
  '/',
  validate(createCustomerSchema),
  controller.createCustomer
);

// GET /api/customers/:id - Get customer by ID
customerRoutes.get('/:id', controller.getCustomer);

// GET /api/customers - Get all customers
customerRoutes.get('/', controller.getAllCustomers);

export default customerRoutes;
```

---

### Step 9: Register Routes in Main Router

**File: `src/routes/index.ts`**

```typescript
import { Hono } from 'hono';
import customerRoutes from './customer.routes';

const router = new Hono();

// Register all routes
router.route('/customers', customerRoutes);

export default router;
```

---

### Step 10: Update Main Application

**File: `src/index.ts`**

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import router from './routes';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/', (c) => {
  return c.json({ message: 'Credit Management API' });
});

// API routes
app.route('/api', router);

// Start server
const port = process.env.PORT || 3000;

console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
```

---

## Testing the Endpoint

### 1. Start the server:
```bash
npm run dev
```

### 2. Test with cURL:

**Create Customer:**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "creditLimit": 5000
  }'
```

**Get All Customers:**
```bash
curl http://localhost:3000/api/customers
```

**Get Customer by ID:**
```bash
curl http://localhost:3000/api/customers/{customer-id}
```

---

## Flow Summary

When a POST request hits `/api/customers`:

1. **Route** receives the request
2. **Validation Middleware** checks the data format
3. **Controller** extracts the request body
4. **Service** applies business logic (checks duplicates)
5. **Repository** saves to database via Prisma
6. Response flows back through Controller to Client

---

## Benefits of This Structure

✅ **Separation of Concerns** - Each layer has one job
✅ **Testability** - Easy to unit test each layer
✅ **Maintainability** - Changes in one layer don't affect others
✅ **Scalability** - Easy to add new features
✅ **Type Safety** - TypeScript catches errors early
✅ **Reusability** - Services and repositories can be reused

---

## Next Steps

1. Add authentication middleware
2. Add error handling middleware
3. Add logging
4. Add pagination for GET all endpoints
5. Add more business logic (credit calculations, etc.)

This pattern can be repeated for any new entity (transactions, payments, etc.)!