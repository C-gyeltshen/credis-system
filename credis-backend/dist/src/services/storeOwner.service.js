import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StoreOwnerRepository } from "../repositories/storeOwner.repository.js";
const storeOwnerRepository = new StoreOwnerRepository();
// Environment Variables
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";
// 1 Month = 30 days | 6 Months = 180 days
const ACCESS_TOKEN_EXPIRY = "30d";
const REFRESH_TOKEN_EXPIRY = "180d";
// Milliseconds for Database Timestamps
const MS_IN_DAY = 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * MS_IN_DAY;
const SIX_MONTHS_MS = 180 * MS_IN_DAY;
export class StoreOwnerService {
    async register(data) {
        const existing = await storeOwnerRepository.findByPhoneNumberWithPassword(data.phoneNumber);
        if (existing)
            throw new Error("PhoneNumber already registered");
        const password = await bcrypt.hash(data.password, 10);
        const owner = await storeOwnerRepository.create({ ...data, password });
        return {
            id: owner.id,
            name: owner.name,
            storeId: owner.storeId,
            isActive: owner.isActive,
            createdAt: owner.createdAt,
        };
    }
    async login(phoneNumber, password) {
        const owner = await storeOwnerRepository.findByPhoneNumberWithPassword(phoneNumber);
        if (!owner)
            throw new Error("Invalid credentials");
        const valid = await bcrypt.compare(password, owner.passwordHash);
        if (!valid)
            throw new Error("Invalid credentials");
        await storeOwnerRepository.setLastLogin(owner.id, new Date());
        // 1. Generate JWTs
        const accessToken = this.generateAccessToken({
            id: owner.id,
            phoneNumber: owner.phoneNumber,
            name: owner.name,
            storeId: owner.storeId,
        });
        const refreshToken = this.generateRefreshToken({
            id: owner.id,
            phoneNumber: owner.phoneNumber,
            name: owner.name,
            storeId: owner.storeId,
        });
        // 2. Calculate Expiry Dates for DB
        const accessExpiresAt = new Date(Date.now() + ONE_MONTH_MS);
        const refreshExpiresAt = new Date(Date.now() + SIX_MONTHS_MS);
        // 3. Save Refresh Token to DB
        const refreshTokenRecord = await storeOwnerRepository.saveRefreshToken(owner.id, refreshToken, refreshExpiresAt);
        // 4. Save Access Token linked to the Refresh Token session
        await storeOwnerRepository.saveAccessToken(owner.id, refreshTokenRecord.id, accessToken, accessExpiresAt);
        return {
            accessToken,
            refreshToken,
            user: {
                id: owner.id,
                name: owner.name,
                phoneNumber: owner.phoneNumber,
                storeId: owner.storeId,
                isActive: owner.isActive,
            },
        };
    }
    async refresh(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            // Verify token exists in DB and hasn't been revoked/expired
            const isValid = await storeOwnerRepository.findRefreshToken(decoded.id, refreshToken);
            if (!isValid)
                throw new Error("Token revoked or invalid");
            const owner = await storeOwnerRepository.findById(decoded.id);
            if (!owner)
                throw new Error("User inactive");
            // Generate new access token
            const newAccessToken = this.generateAccessToken({
                id: owner.id,
                phoneNumber: owner.phoneNumber,
                name: owner.name,
                storeId: owner.storeId,
            });
            // Update the access token record in DB for the new token
            const accessExpiresAt = new Date(Date.now() + ONE_MONTH_MS);
            await storeOwnerRepository.saveAccessToken(owner.id, isValid.id, // Linked to existing refresh token ID
            newAccessToken, accessExpiresAt);
            return {
                accessToken: newAccessToken,
                user: {
                    id: owner.id,
                    name: owner.name,
                    storeId: owner.storeId,
                    isActive: owner.isActive,
                    createdAt: owner.createdAt,
                },
            };
        }
        catch (error) {
            // If it's an error we threw manually, just re-throw it
            if (error instanceof Error &&
                (error.message === "Token revoked or invalid" ||
                    error.message === "User inactive")) {
                throw error;
            }
            // Otherwise, log the unexpected system error and throw a generic one
            console.error("JWT Refresh System Error:", error);
            throw new Error("Invalid refresh token", { cause: error });
        }
    }
    async logout(storeOwnerId) {
        await storeOwnerRepository.revokeAllRefreshTokens(storeOwnerId);
        return { success: true };
    }
    async getProfile(id) {
        const owner = await storeOwnerRepository.findById(id);
        if (!owner)
            throw new Error("Store owner not found");
        return {
            id: owner.id,
            name: owner.name,
            storeId: owner.storeId,
            isActive: owner.isActive,
            createdAt: owner.createdAt,
        };
    }
    generateAccessToken(payload) {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        });
    }
    generateRefreshToken(payload) {
        return jwt.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        });
    }
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        }
        catch {
            return null;
        }
    }
}
