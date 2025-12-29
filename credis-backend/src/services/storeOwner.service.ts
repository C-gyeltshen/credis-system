import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StoreOwnerRepository } from "../repositories/storeOwner.repository.js";
import type { CreateStoreOwnerInput } from "../types/storeOwner.types.js";

const storeOwnerRepository = new StoreOwnerRepository();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

interface TokenPayload {
  id: string;
  email: string;
  name: string;
  storeId?: string | null;
}

export class StoreOwnerService {
  async register(data: CreateStoreOwnerInput) {
    const existing = await storeOwnerRepository.findByEmail(data.email);
    if (existing) throw new Error("Email already registered");

    const password = await bcrypt.hash(data.password, 10);
    const owner = await storeOwnerRepository.create({ ...data, password });
    
    return {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      storeId: owner.storeId,
      isActive: owner.isActive,
      createdAt: owner.createdAt,
    };
  }

  async login(email: string, password: string) {
    const owner = await storeOwnerRepository.findByEmailWithPassword(email);
    if (!owner || !owner.isActive) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, owner.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    await storeOwnerRepository.setLastLogin(owner.id, new Date());

    // Generate tokens
    const accessToken = this.generateAccessToken({
      id: owner.id,
      email: owner.email,
      name: owner.name,
      storeId: owner.storeId,
    });

    const refreshToken = this.generateRefreshToken({
      id: owner.id,
      email: owner.email,
      name: owner.name,
      storeId: owner.storeId,
    });

    // Save refresh token hash to DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await storeOwnerRepository.saveRefreshToken(owner.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        storeId: owner.storeId,
        isActive: owner.isActive,
        createdAt: new Date(),
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as TokenPayload;

      // Verify token exists in DB and hasn't been revoked
      const isValid = await storeOwnerRepository.findRefreshToken(
        decoded.id,
        refreshToken
      );
      if (!isValid) throw new Error("Token revoked or invalid");

      const owner = await storeOwnerRepository.findById(decoded.id);
      if (!owner || !owner.isActive) throw new Error("User inactive");

      // Generate new access token
      const newAccessToken = this.generateAccessToken({
        id: owner.id,
        email: owner.email,
        name: owner.name,
        storeId: owner.storeId,
      });

      return {
        accessToken: newAccessToken,
        user: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          storeId: owner.storeId,
          isActive: owner.isActive,
          createdAt: owner.createdAt,
        },
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  async logout(storeOwnerId: string) {
    await storeOwnerRepository.revokeAllRefreshTokens(storeOwnerId);
    return { success: true };
  }

  async getProfile(id: string) {
    const owner = await storeOwnerRepository.findById(id);
    if (!owner) throw new Error("Store owner not found");

    return {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      storeId: owner.storeId,
      isActive: owner.isActive,
      createdAt: owner.createdAt,
    };
  }

  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  }

  // Verify access token (used by auth middleware)
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }
}