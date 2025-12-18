import { Hono } from 'hono';
import { CustomerController } from '../controllers/customer.controller.js';
import { createCustomerSchema } from '../validators/customer.validator.js';
import { validate } from '../middlewares/validation.js';

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