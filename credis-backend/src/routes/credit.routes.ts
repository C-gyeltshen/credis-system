import { Hono } from "hono";
import { CreditController } from "../controllers/credit.controller.js";
import {
  createCreditSchema,
  updateCreditSchema,
} from "../validators/credit.validator.js";
import { validate } from "../middlewares/validation.js";

const creditRoutes = new Hono();
const controller = new CreditController();

// POST /api/credits - Create new credit transaction
creditRoutes.post("/", validate(createCreditSchema), controller.createCredit);

// GET /api/credits/:id - Get credit transaction by ID
creditRoutes.get("/:id", controller.getCredit);

// GET /api/credits - Get all credit transactions or filter
creditRoutes.get("/", controller.getAllCredits);

// PATCH /api/credits/:id - Update credit transaction
creditRoutes.patch(
  "/:id",
  validate(updateCreditSchema),
  controller.updateCredit
);

// DELETE /api/credits/:id - Delete credit transaction
creditRoutes.delete("/:id", controller.deleteCredit);

// GET /api/credits/customer/:customerId - Get all transactions for a customer
creditRoutes.get("/customer/:customerId", controller.getCustomerCredits);

// GET /api/credits/store/:storeId - Get all transactions for a store
creditRoutes.get("/store/:storeId", controller.getStoreCredits);

// GET /api/credits/filter - Get credit transactions by filters (query params)
creditRoutes.get("/filter", controller.getCreditsByFilters);

// GET /api/credits/customer/:customerId/summary - Get customer credit summary
creditRoutes.get(
  "/customer/:customerId/summary",
  controller.getCustomerSummary
);

// GET /api/credits/store/:storeId/summary - Get store credit summary
creditRoutes.get("/store/:storeId/summary", controller.getStoreSummary);

// GET /api/credits/recent - Get recent transactions
creditRoutes.get("/recent", controller.getRecentTransactions);

// GET /api/credits/date-range - Get transactions by date range
creditRoutes.get("/date-range", controller.getTransactionsByDateRange);

// GET /api/credits/store/:storeId/outstanding?limit=N - Get top N customers with highest outstanding balance
creditRoutes.get(
  "/store/:storeId/outstanding",
  controller.getCustomersWithOutstandingBalance
);

export default creditRoutes;
