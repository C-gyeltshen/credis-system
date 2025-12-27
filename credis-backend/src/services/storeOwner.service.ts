import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StoreOwnerRepository } from "../repositories/storeOwner.repository.js";
import type { CreateStoreOwnerInput } from "../types/storeOwner.types.js";

const storeOwnerRepository = new StoreOwnerRepository();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = "7d";

export class StoreOwnerService {
  async register(data: CreateStoreOwnerInput) {
    // Check if email already exists
    const existing = await storeOwnerRepository.findByEmail(data.email);
    if (existing) throw new Error("Email already registered");

    const password = await bcrypt.hash(data.password, 10);
    const owner = await storeOwnerRepository.create({ ...data, password });
    return { ...owner, passwordHash: undefined };
  }

  async login(email: string, password: string) {
    const owner = await storeOwnerRepository.findByEmailWithPassword(email);
    if (!owner || !owner.isActive) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, owner.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    // Optionally update last login
    await storeOwnerRepository.setLastLogin(owner.id, new Date());

    // Generate JWT
    const token = jwt.sign(
      {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        storeId: owner.storeId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, owner: { ...owner, passwordHash: undefined } };
  }

  async getProfile(id: string) {
    const owner = await storeOwnerRepository.findById(id);
    if (!owner) throw new Error("Store owner not found");
    return { ...owner, passwordHash: undefined };
  }

  // Add more business logic as needed (update, deactivate, etc.)
}
