import { z } from "zod";
export const createStoreOwnerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    storeId: z.string().uuid("Invalid storeId").optional(),
});
export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password required"),
});
export const updateStoreOwnerSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    storeId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
});
