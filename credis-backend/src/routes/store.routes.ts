import { Hono } from "hono";
import { StoreController } from "../controllers/store.controller.js";
import { createStoreSchema } from "../validators/store.validator.js";
import { validate } from "../middlewares/validation.js";

const storeRoutes = new Hono();
const controller = new StoreController();

// POST /api/stores - Create new store
storeRoutes.post("/", validate(createStoreSchema), controller.createStore);

// GET /api/stores/:id - Get store by ID
storeRoutes.get("/:id", controller.getStore);

// GET /api/stores - Get all stores
storeRoutes.get("/", controller.getAllStores);

// PUT /api/stores/:id - Update store
storeRoutes.put("/:id", controller.updateStore);

// DELETE /api/stores/:id - Delete store
storeRoutes.delete("/:id", controller.deleteStore);

// GET /api/stores/:id/customers - Get store with customers
storeRoutes.get("/:id/customers", controller.getStoreWithCustomers);

// GET /api/stores/:id/owners - Get store with owners
storeRoutes.get("/:id/owners", controller.getStoreWithOwners);

export default storeRoutes;
