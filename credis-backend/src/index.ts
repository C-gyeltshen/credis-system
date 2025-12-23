import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());
app.use("*", errorHandler);

// Health check
app.get("/", (c) => {
  return c.json({ message: "Credit Management API" });
});

// API routes
app.route("/api", router);

// Start server
const port = process.env.PORT || 8080;

serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`Server running on http://localhost:${port}`);
