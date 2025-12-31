import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone_number: z.string().length(8, "Invalid Phone Number, Please enter the corret Phone Number"), 
    creditLimit: z.number().min(0).optional().default(0)
});

export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;