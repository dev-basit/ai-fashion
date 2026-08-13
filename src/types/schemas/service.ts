import { z } from "zod/v4";

export const serviceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  base_price: z.string().min(1, "Price is required"),
  duration_mins: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
