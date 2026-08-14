import { z } from "zod/v4";

export const appointmentSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  service_id: z.string().min(1, "Service is required"),
  staff_profile_id: z.string().min(1, "Staff is required"),
  starts_at: z.string().min(1, "Date/time is required"),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
