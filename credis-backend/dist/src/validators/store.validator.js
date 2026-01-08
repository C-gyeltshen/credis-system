import z from "zod";
export const createStoreSchema = z.object({
    name: z.string()
        .min(2, "Store name must be at least2 Characters")
});
