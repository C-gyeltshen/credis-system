import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = new Hono();

// CORS FIRST - before all other middleware
app.use(
  "*",
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8081",
      "http://localhost:*",
    ],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Then other middleware
app.use("*", logger());
app.use("*", errorHandler);

// Health check
app.get("/", (c) => {
  return c.json({ message: "Credit Management API" });
});

// API routes
app.route("/api", router);

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 8080;
  
  serve({
    fetch: app.fetch,
    port: Number(port),
  });

  console.log(`Server running on http://localhost:${port}`);
}

export { app };