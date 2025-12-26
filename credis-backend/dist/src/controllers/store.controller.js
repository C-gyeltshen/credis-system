import { StoreService } from "../services/store.service.js";
export class StoreController {
    service;
    constructor() {
        this.service = new StoreService();
    }
    createStore = async (c) => {
        try {
            const body = await c.req.json();
            const store = await this.service.createStore(body);
            return c.json({
                success: true,
                message: "Store created successfully",
                data: store,
            }, 201);
        }
        catch (error) {
            return c.json({
                success: false,
                message: error.message || "Failed to create store",
            }, 400);
        }
    };
    getStore = async (c) => {
        try {
            const id = c.req.param("id");
            const store = await this.service.getStore(id);
            return c.json({
                success: true,
                data: store,
            }, 200);
        }
        catch (error) {
            return c.json({
                success: false,
                message: error.message,
            }, 404);
        }
    };
    getAllStores = async (c) => {
        try {
            const stores = await this.service.getAllStores();
            return c.json({
                success: true,
                data: stores,
            }, 200);
        }
        catch (error) {
            return c.json({
                success: false,
                message: error.message,
            }, 500);
        }
    };
    updateStore = async (c) => {
        try {
            const id = c.req.param("id");
            const body = await c.req.json();
            const store = await this.service.updateStore(id, body);
            return c.json({
                success: true,
                message: "Store updated successfully",
                data: store,
            }, 200);
        }
        catch (error) {
            return c.json({
                success: false,
                message: error.message || "Failed to update store",
            }, 400);
        }
    };
    deleteStore = async (c) => {
        try {
            const id = c.req.param("id");
            const result = await this.service.deleteStore(id);
            return c.json({
                success: true,
                message: result.message,
            }, 200);
        }
        catch (error) {
            return c.json({
                success: false,
                message: error.message || "Failed to delete store",
            }, 400);
        }
    };
    getStoreWithCustomers = async (c) => {
        try {
            const id = c.req.param("id");
            const store = await this.service.getStoreWithCustomers(id);
            return c.json({
                success: true,
                data: store,
            }, 200);
        }
        catch (error) {
            return c.json({
                success: false,
                message: error.message,
            }, 404);
        }
    };
    getStoreWithOwners = async (c) => {
        try {
            const id = c.req.param("id");
            const store = await this.service.getStoreWithOwners(id);
            return c.json({
                success: true,
                data: store,
            }, 200);
        }
        catch (error) {
            return c.json({
                success: false,
                message: error.message,
            }, 404);
        }
    };
}
