import z from "zod";

export const createStoreSchema = z.object({
    name: z.string()
        .min(2,"Store name must be at least2 Characters"),
    address: z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address is too long'),
    phone_number: z.string()
        .length(8, "Invalid Phone Number, Please enter the corret Phone Number")
})

export type CreateCustomerSchema = z.infer<typeof createStoreSchema>;
