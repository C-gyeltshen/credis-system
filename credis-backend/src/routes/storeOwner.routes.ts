import { Hono } from "hono";
import { StoreOwnerController } from "../controllers/storeOwner.controller.js";
import { createStoreOwnerSchema } from "../validators/storeOwner.validator.js";
import { validate } from "../middlewares/validation.js";

const storeOwnerRoutes = new Hono();
const controller = new StoreOwnerController();

// POST /api/store-owners/register - Register new store owner
storeOwnerRoutes.post("/register", validate(createStoreOwnerSchema), (c) =>
  controller.register(c)
);

// POST /api/store-owners/login - Store owner login
storeOwnerRoutes.post("/login", (c) => controller.login(c));

// GET /api/store-owners/:id - Get store owner profile
storeOwnerRoutes.get("/:id", (c) => controller.getProfile(c));

// Add more endpoints as needed (update, deactivate, etc.)

export default storeOwnerRoutes;
