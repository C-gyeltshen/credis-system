import { z } from "zod";
export const createCreditSchema = z
    .object({
    customer_id: z.string().uuid("Invalid customer ID format"),
    store_id: z.string().uuid("Invalid store ID format"),
    amount: z
        .number()
        .positive("Amount must be positive")
        .min(0.01, "Amount must be at least 0.01")
        .max(999999999.99, "Amount exceeds maximum allowed"),
    transaction_type: z.enum(["credit_given", "payment_received"], {
        message: "Transaction type must be either credit_given or payment_received",
    }),
    items_description: z
        .string()
        .max(1000, "Items description is too long")
        .optional(),
    journal_number: z
        .string()
        .max(100, "Journal number is too long")
        .optional(),
    created_by_owner_id: z.string().uuid("Invalid owner ID format").optional(),
})
    .refine((data) => {
    if (data.transaction_type === "payment_received") {
        return (data.journal_number !== undefined &&
            data.journal_number !== null &&
            data.journal_number.trim() !== "");
    }
    return true;
}, {
    message: "Journal number is required for payment_received transactions",
    path: ["journal_number"],
});
export const updateCreditSchema = z
    .object({
    amount: z
        .number()
        .positive("Amount must be positive")
        .min(0.01, "Amount must be at least 0.01")
        .max(999999999.99, "Amount exceeds maximum allowed")
        .optional(),
    transaction_type: z
        .enum(["credit_given", "payment_received"], {
        message: "Transaction type must be either credit_given or payment_received",
    })
        .optional(),
    transaction_date: z.string().datetime().optional().or(z.date().optional()),
    items_description: z
        .string()
        .max(1000, "Items description is too long")
        .optional(),
    journal_number: z
        .string()
        .max(100, "Journal number is too long")
        .optional(),
})
    .refine((data) => {
    if (data.transaction_type === "payment_received") {
        return (data.journal_number !== undefined &&
            data.journal_number !== null &&
            data.journal_number.trim() !== "");
    }
    return true;
}, {
    message: "Journal number is required for payment_received transactions",
    path: ["journal_number"],
});
export const creditTransactionFiltersSchema = z
    .object({
    customer_id: z.string().uuid("Invalid customer ID format").optional(),
    store_id: z.string().uuid("Invalid store ID format").optional(),
    transaction_type: z.enum(["credit_given", "payment_received"]).optional(),
    start_date: z.string().datetime().optional().or(z.date().optional()),
    end_date: z.string().datetime().optional().or(z.date().optional()),
    min_amount: z.number().min(0).optional(),
    max_amount: z.number().min(0).optional(),
})
    .refine((data) => {
    if (data.start_date && data.end_date) {
        return new Date(data.start_date) <= new Date(data.end_date);
    }
    return true;
}, {
    message: "Start date must be before or equal to end date",
    path: ["start_date"],
})
    .refine((data) => {
    if (data.min_amount !== undefined && data.max_amount !== undefined) {
        return data.min_amount <= data.max_amount;
    }
    return true;
}, {
    message: "Minimum amount must be less than or equal to maximum amount",
    path: ["min_amount"],
});
export const creditIdParamSchema = z.object({
    id: z.string().uuid("Invalid credit ID format"),
});
