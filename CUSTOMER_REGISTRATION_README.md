# Credis System - Customer Registration (FR1.1)

## Implementation Overview

This implementation provides a complete customer registration system that allows shop owners to create, update, and search for customer records as specified in requirement FR1.1.

## Features Implemented

### Backend API (Node.js + Hono + Prisma)

- **RESTful API** for customer management
- **CRUD Operations**: Create, Read, Update, Delete customers
- **Search Functionality**: Search customers by name, phone, email, address, or CID
- **Pagination**: Efficient loading of customer lists
- **Data Validation**: Server-side validation for all customer fields
- **Soft Delete**: Customers are marked as inactive instead of being permanently deleted

### Frontend Mobile App (React Native + Expo)

- **Customer List Screen**: Display all customers with search and pagination
- **Customer Form Screen**: Add/Edit customer information
- **Tab Navigation**: Easy access to customer management
- **Real-time Search**: Search customers as you type
- **Form Validation**: Client-side validation with error messages
- **Responsive UI**: Modern, mobile-friendly interface

## API Endpoints

### Base URL: `http://localhost:8888/api`

#### Customer Endpoints

- `GET /customers` - Get paginated list of customers with search
- `POST /customers` - Create a new customer
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Soft delete customer

#### Query Parameters for GET /customers

- `storeId` (required) - Store ID
- `search` (optional) - Search term
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

## Customer Data Model

```typescript
interface Customer {
  id: string; // UUID
  storeId: string; // Store reference
  name: string; // Customer name (required)
  phoneNumber: string; // Phone number (required, unique per store)
  address?: string; // Customer address
  email?: string; // Email address
  cidNumber?: string; // CID/ID number
  creditLimit?: number; // Credit limit in currency
  isActive: boolean; // Soft delete flag
  createdAt: Date; // Creation timestamp
  modifiedAt: Date; // Last update timestamp
}
```

## Database Schema

The system uses PostgreSQL with Prisma ORM. Key features of the schema:

- **UUID primary keys** for all entities
- **Composite unique constraint** on storeId + phoneNumber
- **Indexes** on frequently queried fields
- **Soft delete** using isActive flag
- **Audit trails** with created/modified timestamps

## Setup Instructions

### Backend Setup

1. Navigate to credis-backend directory
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/credis_db"
   PORT=8888
   ```
4. Generate Prisma client: `npx prisma generate`
5. Run database migrations: `npx prisma migrate dev`
6. Start development server: `npm run dev`

### Frontend Setup

1. Navigate to credis-frontend directory
2. Install dependencies: `npm install`
3. Update the store ID in `lib/config.ts`
4. Start Expo development server: `npm start`

## Configuration

### API Configuration (`lib/config.ts`)

```typescript
export const API_CONFIG = {
  BASE_URL: "http://localhost:8888/api",
  ENDPOINTS: {
    CUSTOMERS: "/customers",
  },
};

export const STORE_CONFIG = {
  STORE_ID: "your-actual-store-id",
};
```

## Usage Examples

### Creating a Customer

```bash
curl -X POST http://localhost:8888/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store-uuid",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "email": "john@example.com",
    "creditLimit": 1000.00
  }'
```

### Searching Customers

```bash
curl "http://localhost:8888/api/customers?storeId=store-uuid&search=john&page=1&limit=10"
```

## Validation Rules

### Required Fields

- `name`: Customer name
- `phoneNumber`: Phone number (must be unique per store)
- `storeId`: Store identifier

### Optional Fields

- `address`: Customer address
- `email`: Valid email address format
- `cidNumber`: Customer ID number
- `creditLimit`: Numeric value (decimal)

### Business Rules

- Phone numbers must be unique within each store
- Customers are soft-deleted (marked inactive) rather than removed
- All monetary values use decimal precision for accuracy
- Search is case-insensitive and covers all text fields

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful operation
- `201 Created` - Customer created successfully
- `400 Bad Request` - Validation errors
- `404 Not Found` - Customer not found
- `409 Conflict` - Duplicate phone number
- `500 Internal Server Error` - Server errors

## Security Considerations

- Input validation on both client and server sides
- SQL injection prevention through Prisma ORM
- CORS configuration for cross-origin requests
- Environment variables for sensitive configuration

## Future Enhancements

- Authentication and authorization
- Customer profile photos
- Import/export functionality
- Advanced filtering options
- Customer activity history
- Backup and restore capabilities

## Testing

The system can be tested using:

- Mobile app interface for end-to-end testing
- cURL commands for API testing
- Postman collection for comprehensive API testing
- Unit tests (to be implemented)

## Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Hono** - Fast web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety

### Frontend

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - Navigation

## Support

For issues or questions regarding the customer registration system, please refer to the API documentation or contact the development team.
