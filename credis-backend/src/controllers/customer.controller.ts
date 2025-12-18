import type { Context } from 'hono';
import { CustomerService } from '../services/customer.service.js';
import type { CreateCustomerInput } from '../types/customer.types.js';


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