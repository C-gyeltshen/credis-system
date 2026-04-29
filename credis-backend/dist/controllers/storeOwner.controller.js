import { StoreOwnerService } from "../services/storeOwner.service.js";
const storeOwnerService = new StoreOwnerService();
function buildCookieAttributes(c, maxAgeSeconds) {
    const reqUrl = new URL(c.req.url);
    const origin = c.req.header("origin");
    const isHttps = reqUrl.protocol === "https:" || (origin ? origin.startsWith("https://") : false);
    // Determine cross-site by comparing origins (scheme+host+port)
    let isCrossSite = false;
    try {
        if (origin) {
            const backendOrigin = `${reqUrl.protocol}//${reqUrl.host}`;
            isCrossSite = origin !== backendOrigin;
        }
    }
    catch {
        isCrossSite = false;
    }
    // SameSite strategy: use None only when cross-site over HTTPS; else Lax
    const sameSite = isCrossSite && isHttps ? "None" : "Lax";
    const secure = isHttps ? "Secure; " : "";
    return `HttpOnly; ${secure}SameSite=${sameSite}; Path=/; Max-Age=${maxAgeSeconds}`;
}
export class StoreOwnerController {
    async register(c) {
        try {
            const data = c.get("validatedData");
            const owner = await storeOwnerService.register(data);
            return c.json({ success: true, user: owner }, 201);
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    }
    async login(c) {
        try {
            const { phoneNumber, password } = c.get("validatedData");
            const { accessToken, refreshToken, user } = await storeOwnerService.login(phoneNumber, password);
            const accessAttrs = buildCookieAttributes(c, 30 * 24 * 60 * 60);
            const refreshAttrs = buildCookieAttributes(c, 6 * 30 * 24 * 60 * 60);
            // Set HttpOnly cookies
            c.header("Set-Cookie", `accessToken=${accessToken}; ${accessAttrs}`);
            c.header("Set-Cookie", `refreshToken=${refreshToken}; ${refreshAttrs}`, { append: true });
            return c.json({ success: true, user }, 200);
        }
        catch (error) {
            return c.json({ error: error.message }, 401);
        }
    }
    async refresh(c) {
        try {
            const cookies = c.req.header("Cookie");
            const refreshToken = this.extractCookie(cookies, "refreshToken");
            if (!refreshToken) {
                return c.json({ error: "No refresh token" }, 401);
            }
            const { accessToken, user } = await storeOwnerService.refresh(refreshToken);
            // Set new access token cookie
            const accessAttrs = buildCookieAttributes(c, 30 * 24 * 60 * 60);
            c.header("Set-Cookie", `accessToken=${accessToken}; ${accessAttrs}`);
            return c.json({ success: true, user }, 200);
        }
        catch (error) {
            return c.json({ error: error.message }, 401);
        }
    }
    async logout(c) {
        try {
            const user = c.get("user");
            await storeOwnerService.logout(user.id);
            // Clear cookies
            // Use the same attributes (SameSite/Secure) used during set, but with Max-Age=0
            const accessAttrs = buildCookieAttributes(c, 0);
            const refreshAttrs = buildCookieAttributes(c, 0);
            c.header("Set-Cookie", `accessToken=; ${accessAttrs}`);
            c.header("Set-Cookie", `refreshToken=; ${refreshAttrs}`, { append: true });
            return c.json({ success: true }, 200);
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    }
    async getProfile(c) {
        try {
            const user = c.get("user"); // Get user from auth middleware
            if (!user.id) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            const profile = await storeOwnerService.getProfile(user.id);
            return c.json({ success: true, user: profile }, 200);
        }
        catch (error) {
            return c.json({ error: error.message }, 404);
        }
    }
    async getProfileById(c) {
        try {
            const id = c.req.param("id");
            const profile = await storeOwnerService.getProfile(id);
            return c.json({ success: true, user: profile }, 200);
        }
        catch (error) {
            return c.json({ error: error.message }, 404);
        }
    }
    extractCookie(cookieHeader, name) {
        if (!cookieHeader)
            return null;
        const cookies = cookieHeader.split(";");
        for (const cookie of cookies) {
            const [key, value] = cookie.trim().split("=");
            if (key === name)
                return value;
        }
        return null;
    }
}
