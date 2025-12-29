import { prisma } from "../../lib/prisma.js";
import type {
  CreateStoreOwnerInput,
  UpdateStoreOwnerInput,
} from "../types/storeOwner.types.js";
import bcrypt from "bcrypt";

export class StoreOwnerRepository {
  async create(data: CreateStoreOwnerInput) {
    return await prisma.storeOwner.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.password,
        ...(data.storeId && { storeId: data.storeId }),
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.storeOwner.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await prisma.storeOwner.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return await prisma.storeOwner.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: UpdateStoreOwnerInput) {
    return await prisma.storeOwner.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.passwordHash && { passwordHash: data.passwordHash }),
        ...(data.storeId && { storeId: data.storeId }),
        ...(typeof data.isActive === "boolean" && { isActive: data.isActive }),
        ...(data.lastLoginAt && { lastLoginAt: data.lastLoginAt }),
      },
    });
  }

  async delete(id: string) {
    return await prisma.storeOwner.delete({
      where: { id },
    });
  }

  async findByEmailWithPassword(email: string) {
    return await prisma.storeOwner.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        isActive: true,
        storeId: true,
      },
    });
  }

  async setLastLogin(id: string, date: Date) {
    return await prisma.storeOwner.update({
      where: { id },
      data: { lastLoginAt: date },
    });
  }

  // Refresh token management
  async saveRefreshToken(storeOwnerId: string, token: string, expiresAt: Date) {
    const tokenHash = await bcrypt.hash(token, 10);
    return await prisma.refreshToken.create({
      data: {
        storeOwnerId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findRefreshToken(storeOwnerId: string, token: string) {
    const refreshTokens = await prisma.refreshToken.findMany({
      where: {
        storeOwnerId,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const rt of refreshTokens) {
      const isValid = await bcrypt.compare(token, rt.tokenHash);
      if (isValid) {
        return rt;
      }
    }
    return null;
  }

  async revokeRefreshToken(tokenHash: string) {
    return await prisma.refreshToken.update({
      where: { id: tokenHash },
      data: { revoked: true },
    });
  }

  async revokeAllRefreshTokens(storeOwnerId: string) {
    return await prisma.refreshToken.updateMany({
      where: { storeOwnerId },
      data: { revoked: true },
    });
  }
}