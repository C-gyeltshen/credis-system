import { z } from 'zod';
export const createCustomerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    phone_number: z.string().length(8, "Invalid Phone Number, Please enter the corret Phone Number"),
    creditLimit: z.number().min(0).optional().default(0)
});
