import { Hono } from "hono";
import customerRoutes from "./customer.routes.js";
import storeRoutes from "./store.routes.js";
import creditRoutes from "./credit.routes.js";
import storeOwnerRoutes from "./storeOwner.routes.js";
const router = new Hono();
// Register all routes
router.route("/customers", customerRoutes);
router.route("/stores", storeRoutes);
router.route("/credits", creditRoutes);
router.route("/store-owners", storeOwnerRoutes);
export default router;
