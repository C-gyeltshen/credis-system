import type { Context } from "hono";
import { CreditService } from "../services/credit.service.js";
import type {
  CreateCreditInput,
  UpdateCreditInput,
  CreditTransactionFilters,
} from "../types/credit.types.js";

export class CreditController {
  private readonly service: CreditService;

  constructor() {
    this.service = new CreditService();
  }

  createCredit = async (c: Context) => {
    try {
      const body = await c.req.json<CreateCreditInput>();

      const credit = await this.service.createCredit(body);

      return c.json(
        {
          success: true,
          message: "Credit transaction created successfully",
          data: credit,
        },
        201
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || "Failed to create credit transaction",
        },
        400
      );
    }
  };

  getCredit = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const credit = await this.service.getCredit(id);

      return c.json(
        {
          success: true,
          data: credit,
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

  getAllCredits = async (c: Context) => {
    try {
      const credits = await this.service.getAllCredits();

      return c.json(
        {
          success: true,
          data: credits,
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

  getCustomerCredits = async (c: Context) => {
    try {
      const customerId = c.req.param("customerId");
      const credits = await this.service.getCustomerCredits(customerId);

      return c.json(
        {
          success: true,
          data: credits,
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

  getStoreCredits = async (c: Context) => {
    try {
      const storeId = c.req.param("storeId");
      const credits = await this.service.getStoreCredits(storeId);

      return c.json(
        {
          success: true,
          data: credits,
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

  getCreditsByFilters = async (c: Context) => {
    try {
      const query = c.req.query();

      // Parse query parameters
      const filters: CreditTransactionFilters = {
        ...(query.customer_id && { customer_id: query.customer_id }),
        ...(query.store_id && { store_id: query.store_id }),
        ...(query.transaction_type && {
          transaction_type: query.transaction_type as
            | "credit_given"
            | "payment_received",
        }),
        ...(query.start_date && { start_date: new Date(query.start_date) }),
        ...(query.end_date && { end_date: new Date(query.end_date) }),
        ...(query.min_amount && {
          min_amount: Number.parseFloat(query.min_amount),
        }),
        ...(query.max_amount && {
          max_amount: Number.parseFloat(query.max_amount),
        }),
      };

      const credits = await this.service.getCreditsByFilters(filters);

      return c.json(
        {
          success: true,
          data: credits,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        400
      );
    }
  };

  updateCredit = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json<UpdateCreditInput>();

      const credit = await this.service.updateCredit(id, body);

      return c.json(
        {
          success: true,
          message: "Credit transaction updated successfully",
          data: credit,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || "Failed to update credit transaction",
        },
        400
      );
    }
  };

  deleteCredit = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const result = await this.service.deleteCredit(id);

      return c.json(
        {
          success: true,
          message: result.message,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || "Failed to delete credit transaction",
        },
        400
      );
    }
  };

  getCustomerSummary = async (c: Context) => {
    try {
      const customerId = c.req.param("customerId");
      const storeId = c.req.query("store_id");

      const summary = await this.service.getCustomerSummary(
        customerId,
        storeId
      );

      return c.json(
        {
          success: true,
          data: summary,
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

  getStoreSummary = async (c: Context) => {
    try {
      const storeId = c.req.param("storeId");

      const summary = await this.service.getStoreSummary(storeId);

      return c.json(
        {
          success: true,
          data: summary,
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

  getRecentTransactions = async (c: Context) => {
    try {
      const limitQuery = c.req.query("limit");
      const storeId = c.req.query("store_id");
      const limit = limitQuery ? Number.parseInt(limitQuery, 10) : 10;

      const transactions = await this.service.getRecentTransactions(
        limit,
        storeId
      );

      return c.json(
        {
          success: true,
          data: transactions,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        400
      );
    }
  };

  getTransactionsByDateRange = async (c: Context) => {
    try {
      const startDateQuery = c.req.query("start_date");
      const endDateQuery = c.req.query("end_date");
      const storeId = c.req.query("store_id");

      if (!startDateQuery || !endDateQuery) {
        return c.json(
          {
            success: false,
            message: "start_date and end_date query parameters are required",
          },
          400
        );
      }

      const startDate = new Date(startDateQuery);
      const endDate = new Date(endDateQuery);

      const transactions = await this.service.getTransactionsByDateRange(
        startDate,
        endDate,
        storeId
      );

      return c.json(
        {
          success: true,
          data: transactions,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        400
      );
    }
  };

  getCustomersWithOutstandingBalance = async (c: Context) => {
    try {
      const storeId = c.req.param("storeId");

      const customers = await this.service.getCustomersWithOutstandingBalance(
        storeId
      );

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
        404
      );
    }
  };
}
