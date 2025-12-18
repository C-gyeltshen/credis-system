import type { Context } from "hono";
import { StoreService } from "../services/store.service.js";
import type { CreateStoreInput } from "../types/store.types.js";

export class StoreController {
  private service: StoreService;

  constructor() {
    this.service = new StoreService();
  }

  createStore = async (c: Context) => {
    try {
      const body = await c.req.json<CreateStoreInput>();

      const store = await this.service.createStore(body);

      return c.json(
        {
          success: true,
          message: "Store created successfully",
          data: store,
        },
        201
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || "Failed to create store",
        },
        400
      );
    }
  };

  getStore = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const store = await this.service.getStore(id);

      return c.json(
        {
          success: true,
          data: store,
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

  getAllStores = async (c: Context) => {
    try {
      const stores = await this.service.getAllStores();

      return c.json(
        {
          success: true,
          data: stores,
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

  updateStore = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json<Partial<CreateStoreInput>>();

      const store = await this.service.updateStore(id, body);

      return c.json(
        {
          success: true,
          message: "Store updated successfully",
          data: store,
        },
        200
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || "Failed to update store",
        },
        400
      );
    }
  };

  deleteStore = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const result = await this.service.deleteStore(id);

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
          message: error.message || "Failed to delete store",
        },
        400
      );
    }
  };

  getStoreWithCustomers = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const store = await this.service.getStoreWithCustomers(id);

      return c.json(
        {
          success: true,
          data: store,
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

  getStoreWithOwners = async (c: Context) => {
    try {
      const id = c.req.param("id");
      const store = await this.service.getStoreWithOwners(id);

      return c.json(
        {
          success: true,
          data: store,
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
