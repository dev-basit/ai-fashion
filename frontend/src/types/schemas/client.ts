import { z } from "zod/v4";

export const clientSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
