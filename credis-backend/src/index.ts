import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = new Hono();

// Middleware
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:8081",      // Your frontend dev URL
      "http://localhost:3000",      // Alternative dev port
      "http://localhost:19006",     // Expo web
      "http://localhost:19000",     // Expo tunnel
      process.env.FRONTEND_URL || "", // Production frontend URL
    ].filter(Boolean), // Remove empty strings
    credentials: true, // Allow cookies
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("*", logger());
app.use("*", errorHandler);

// Health check
app.get("/", (c) => {
  return c.json({ message: "Credit Management API" });
});

// API routes
app.route("/api", router);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 8080;
  
  serve({
    fetch: app.fetch,
    port: Number(port),
  });

  console.log(`Server running on http://localhost:${port}`);
}

// Export app for testing
export { app };