import { z } from "zod";

export const createStoreOwnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().length(8, "Phone number should be of length 8"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  storeId: z.string().uuid("Invalid storeId").optional(),
});

export const loginSchema = z.object({
  phoneNumber: z.string().length(8, "Phone number should be of length 8"),
  password: z.string().min(1, "Password required"),
});

export const updateStoreOwnerSchema = z.object({
  name: z.string().min(2).optional(),
  phoneNumber: z.string().length(8).optional,
  password: z.string().min(4).optional(),
  storeId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export type CreateStoreOwnerSchema = z.infer<typeof createStoreOwnerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type UpdateStoreOwnerSchema = z.infer<typeof updateStoreOwnerSchema>;
