import { Context } from "hono";
import { StoreOwnerService } from "../services/storeOwner.service.js";
import type { CreateStoreOwnerSchema } from "../validators/storeOwner.validator.js";

const storeOwnerService = new StoreOwnerService();

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
      const { email, password } = c.get("validatedData") as {
        email: string;
        password: string;
      };

      const { accessToken, refreshToken, user } = await storeOwnerService.login(
        email,
        password
      );

      // Set HttpOnly cookies
      c.header(
        "Set-Cookie",
        `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
          30 * 24 * 60 * 60
        }`
      );

      c.header(
        "Set-Cookie",
        `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
          6 * 30 * 24 * 60 * 60
        }`,
        { append: true }
      );

      return c.json({ success: true, user }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 401);
    }
  }

  async refresh(c: Context) {
    try {
      const cookies = c.req.header("Cookie");
      const refreshToken = this.extractCookie(cookies, "refreshToken");

      if (!refreshToken) {
        return c.json({ error: "No refresh token" }, 401);
      }

      const { accessToken, user } = await storeOwnerService.refresh(
        refreshToken
      );

      // Set new access token cookie
      c.header(
        "Set-Cookie",
        `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
          30 * 24 * 60 * 60
        }`
      );

      return c.json({ success: true, user }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 401);
    }
  }

  async logout(c: Context) {
    try {
      const user = c.get("user");
      await storeOwnerService.logout(user.id);

      // Clear cookies
      c.header(
        "Set-Cookie",
        `accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
      );

      c.header(
        "Set-Cookie",
        `refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        { append: true }
      );

      return c.json({ success: true }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }

  async getProfile(c: Context) {
    try {
      const user = c.get("user");
      const profile = await storeOwnerService.getProfile(user.id);
      return c.json({ success: true, user: profile }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
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
