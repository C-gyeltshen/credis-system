import { z } from "zod";

// Validator for creating a StoreOwner
export const createStoreOwnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password hash must be at least 6 characters"),
  storeId: z.string().uuid("Invalid storeId").optional(),
});

// Validator for updating a StoreOwner
export const updateStoreOwnerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  storeId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  lastLoginAt: z.coerce.date().optional(),
});

export type CreateStoreOwnerSchema = z.infer<typeof createStoreOwnerSchema>;
export type UpdateStoreOwnerSchema = z.infer<typeof updateStoreOwnerSchema>;
