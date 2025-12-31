import type { Context } from "hono";
import { CustomerService } from "../services/customer.service.js";
import type { CreateCustomerInput } from "../types/customer.types.js";

export class CustomerController {
  private readonly service: CustomerService;

  constructor() {
    this.service = new CustomerService();
  }

  createCustomer = async (c: Context) => {
    try {
      const body = await c.req.json<CreateCustomerInput>();

      const customer = await this.service.createCustomer(body);

      return c.json(
        {
          success: true,
          message: "Customer created successfully",
          data: customer,
        },
        201
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || "Failed to create customer",
        },
        400
      );
    }
  };

  getCustomer = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const customer = await this.service.getCustomer(id);

      return c.json(
        {
          success: true,
          data: customer,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        404
      );
    }
  };

  getAllCustomers = async (c: Context) => {
    try {
      const customers = await this.service.getAllCustomers();

      return c.json(
        {
          success: true,
          data: customers,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        500
      );
    }
  };
  getCustomersWithOverduePayments = async (c: Context) => {
    try {
      const daysParam = c.req.query("days");
      const storeId = c.req.query("storeId");
      if (!storeId) {
        return c.json(
          { success: false, message: "Missing storeId parameter" },
          400
        );
      }
      const days = daysParam ? Number.parseInt(daysParam, 10) : 30;
      if (Number.isNaN(days) || days < 0) {
        return c.json(
          { success: false, message: "Invalid days parameter" },
          400
        );
      }
      const customers = await this.service.getCustomersWithOverduePayments(
        days,
        storeId
      );
      return c.json({ success: true, data: customers }, 200);
    } catch (error: any) {
      return c.json({ success: false, message: error.message }, 500);
    }
  };
}
