import { StoreOwnerService } from "../services/storeOwner.service.js";
const storeOwnerService = new StoreOwnerService();
export const authMiddleware = async (c, next) => {
    let token;
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
    }
    else {
        // Try to get token from cookies
        const cookieHeader = c.req.header("Cookie");
        if (cookieHeader) {
            const cookies = Object.fromEntries(cookieHeader.split(";").map((cookie) => {
                const [name, ...rest] = cookie.trim().split("=");
                return [name, rest.join("=")];
            }));
            token = cookies["accessToken"];
        }
    }
    if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    const decoded = storeOwnerService.verifyAccessToken(token);
    if (!decoded) {
        return c.json({ error: "Invalid token" }, 401);
    }
    c.set("user", decoded);
    await next();
};
