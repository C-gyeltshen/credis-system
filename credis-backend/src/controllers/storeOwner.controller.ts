// 
import { Context } from "hono";
import { StoreOwnerService } from "../services/storeOwner.service.js";
import type { CreateStoreOwnerSchema } from "../validators/storeOwner.validator.js";

const storeOwnerService = new StoreOwnerService();

function buildCookieAttributes(c: Context, maxAgeSeconds: number) {
  const reqUrl = new URL(c.req.url);
  const origin = c.req.header("origin");
  
  // Determine if request is HTTPS
  const isHttps = reqUrl.protocol === "https:" || (origin ? origin.startsWith("https://") : false);
  
  // Determine if this is a cross-site request
  let isCrossSite = false;
  if (origin) {
    try {
      // Build backend origin from request URL
      const backendOrigin = `${reqUrl.protocol}//${reqUrl.host}`;
      isCrossSite = origin !== backendOrigin;
      
      console.log("Origin comparison:", {
        requestOrigin: origin,
        backendOrigin: backendOrigin,
        isCrossSite: isCrossSite,
        isHttps: isHttps
      });
    } catch (e) {
      console.error("Error parsing origin:", e);
      isCrossSite = true; // Assume cross-site on error
    }
  }
  
  // SameSite strategy:
  // - Use "None" only when cross-site AND HTTPS (required by spec)
  // - Use "Lax" for same-site or HTTP cross-site (more lenient for development)
  const sameSite = isCrossSite && isHttps ? "None" : "Lax";
  const secure = isHttps ? "Secure; " : "";
  
  return `HttpOnly; ${secure}SameSite=${sameSite}; Path=/; Max-Age=${maxAgeSeconds}`;
}

export class StoreOwnerController {
  async register(c: Context) {
    try {
      const data = c.get("validatedData") as CreateStoreOwnerSchema;
      const owner = await storeOwnerService.register(data);
      return c.json({ success: true, user: owner }, 201);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }

  async login(c: Context) {
    try {
      const { phoneNumber, password } = c.get("validatedData") as {
        phoneNumber: string;
        password: string;
      };

      const { accessToken, refreshToken, user } = await storeOwnerService.login(
        phoneNumber,
        password
      );

      const accessAttrs = buildCookieAttributes(c, 30 * 24 * 60 * 60); // 30 days
      const refreshAttrs = buildCookieAttributes(c, 6 * 30 * 24 * 60 * 60); // 6 months

      // Set HttpOnly cookies
      c.header(
        "Set-Cookie",
        `accessToken=${accessToken}; ${accessAttrs}`
      );

      c.header(
        "Set-Cookie",
        `refreshToken=${refreshToken}; ${refreshAttrs}`,
        { append: true }
      );

      console.log("Login cookies set with attributes:", { accessAttrs, refreshAttrs });

      return c.json({ success: true, user }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 401);
    }
  }

  async refresh(c: Context) {
    try {
      const cookies = c.req.header("Cookie");
      console.log("Refresh endpoint - Received cookies:", cookies);
      
      const refreshToken = this.extractCookie(cookies, "refreshToken");

      if (!refreshToken) {
        console.log("No refresh token found in cookies");
        return c.json({ error: "No refresh token" }, 401);
      }

      const { accessToken, user } = await storeOwnerService.refresh(
        refreshToken
      );

      // Set new access token cookie with same attributes
      const accessAttrs = buildCookieAttributes(c, 30 * 24 * 60 * 60);
      c.header(
        "Set-Cookie",
        `accessToken=${accessToken}; ${accessAttrs}`
      );

      console.log("Refresh successful, new access token set");

      return c.json({ success: true, user }, 200);
    } catch (error: any) {
      console.error("Refresh error:", error);
      return c.json({ error: error.message }, 401);
    }
  }

  async logout(c: Context) {
    try {
      const user = c.get("user");
      await storeOwnerService.logout(user.id);

      // Clear cookies by setting Max-Age=0
      // Important: Use same SameSite/Secure attributes as when setting
      const accessAttrs = buildCookieAttributes(c, 0);
      const refreshAttrs = buildCookieAttributes(c, 0);

      c.header(
        "Set-Cookie",
        `accessToken=; ${accessAttrs}`
      );

      c.header(
        "Set-Cookie",
        `refreshToken=; ${refreshAttrs}`,
        { append: true }
      );

      return c.json({ success: true }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }

  async getProfile(c: Context) {
    try {
      const user = c.get("user"); // Get user from auth middleware
      
      if (!user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const profile = await storeOwnerService.getProfile(user.id);
      return c.json({ success: true, user: profile }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 404);
    }
  }

  async getProfileById(c: Context) {
    try {
      const id = c.req.param("id");
      const profile = await storeOwnerService.getProfile(id);
      return c.json({ success: true, user: profile }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 404);
    }
  }

  private extractCookie(
    cookieHeader: string | undefined,
    name: string
  ): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split("=");
      if (key === name) return value;
    }
    return null;
  }
}