import { StoreOwnerService } from "../services/storeOwner.service.js";
import { Context } from "hono";

const service = new StoreOwnerService();

export class StoreOwnerController {
  async register(c: Context) {
    const data = c.get("validatedData");
    const owner = await service.register(data);
    return c.json({ success: true, owner });
  }

  async login(c: Context) {
    const { email, password } = await c.req.json();
    const result = await service.login(email, password);
    return c.json({ success: true, ...result });
  }

  async getProfile(c: Context) {
    const { id } = c.req.param();
    const owner = await service.getProfile(id);
    return c.json({ success: true, owner });
  }

  // Add more methods as needed (update, deactivate, etc.)
}
