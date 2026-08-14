import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const getMyAppointmentsTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const p = new URLSearchParams();
    if (input.status) p.set("status", input.status);
    const res = await fetch(`${baseUrl}/api/appointments?${p}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const appts = json.data ?? [];
    if (!appts.length) return "You have no appointments.";
    return JSON.stringify(
      appts.slice(0, input.limit ?? 10).map((a: Record<string, unknown>) => ({
        id: a.id,
        service: (a.services as Record<string, unknown>)?.name,
        staff:
          ((a.staff_profiles as Record<string, unknown>)?.profiles as Record<string, unknown>)?.full_name ?? "TBD",
        starts_at: a.starts_at,
        status: a.status,
        price: a.price,
      })),
      null,
      2,
    );
  },
  {
    name: "get_my_appointments",
    description: "List the current user's own appointments. Optionally filter by status or limit results.",
    schema: z.object({
      status: z
        .string()
        .optional()
        .describe("Filter by status: pending | confirmed | in_progress | completed | cancelled | no_show"),
      limit: z.number().optional().describe("Max results to return (default 10)"),
    }),
  },
);

const bookAppointmentTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/appointments`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({
        service_id: input.service_id,
        staff_profile_id: input.staff_profile_id ?? null,
        starts_at: input.starts_at,
        notes: input.notes ?? null,
        status: "pending",
        payment_status: "unpaid",
        price: 0,
        discount: 0,
      }),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to book: ${json.error ?? res.statusText}`;
    const a = json.data as Record<string, unknown>;
    return `Appointment booked! ID: ${a.id}, starts at: ${a.starts_at}, status: ${a.status}.`;
  },
  {
    name: "book_appointment",
    description:
      "Book a new appointment for the current customer. Requires service_id and starts_at (ISO 8601). Use list_services to find service IDs. Use list_staff if the user has a preferred staff member.",
    schema: z.object({
      service_id: z.string().describe("UUID of the service to book"),
      staff_profile_id: z.string().optional().describe("Preferred staff profile UUID — use list_staff to find it"),
      starts_at: z.string().describe("Start datetime in ISO 8601 format, e.g. 2025-08-20T14:00:00"),
      notes: z.string().optional().describe("Special notes or requests"),
    }),
  },
);

// Staff and admin book on behalf of a client — client_id is required
const bookAppointmentForClientTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/appointments`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify({
        client_id: input.client_id,
        service_id: input.service_id,
        staff_profile_id: input.staff_profile_id ?? null,
        starts_at: input.starts_at,
        notes: input.notes ?? null,
        status: "pending",
        payment_status: "unpaid",
        price: 0,
        discount: 0,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.log("json.error ", json.error);
      console.log("json.error.message ", json.error.message);
      console.log("res.statusText§ ", res.statusText);
      return `Failed to book: ${json.error ?? res.statusText}`;
    }
    const a = json.data as Record<string, unknown>;
    return `Appointment booked! ID: ${a.id}, starts at: ${a.starts_at}, status: ${a.status}.`;
  },
  {
    name: "book_appointment_for_client",
    description:
      "Book an appointment on behalf of a client. Requires client_id, service_id, and starts_at. Use get_clients to find the client UUID and list_staff to find a staff UUID.",
    schema: z.object({
      client_id: z.string().describe("UUID of the client profile — use get_clients to find it"),
      service_id: z.string().describe("UUID of the service to book — use list_services to find it"),
      staff_profile_id: z.string().optional().describe("Staff profile UUID — use list_staff to find it"),
      starts_at: z.string().describe("Start datetime in ISO 8601 format, e.g. 2025-08-20T14:00:00"),
      notes: z.string().optional().describe("Special notes or requests"),
    }),
  },
);

const cancelAppointmentTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/appointments/${input.appointment_id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ status: "cancelled", internal_notes: input.reason ?? null }),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to cancel: ${json.error ?? res.statusText}`;
    return `Appointment ${input.appointment_id} cancelled successfully.`;
  },
  {
    name: "cancel_appointment",
    description:
      "Cancel an appointment by ID. Confirm the appointment ID with the user first — use get_my_appointments to find it.",
    schema: z.object({
      appointment_id: z.string().describe("UUID of the appointment to cancel"),
      reason: z.string().optional().describe("Reason for cancellation"),
    }),
  },
);

const getAllAppointmentsTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const p = new URLSearchParams();
    if (input.client_id) p.set("clientId", input.client_id);
    if (input.staff_profile_id) p.set("staffProfileId", input.staff_profile_id);
    if (input.status) p.set("status", input.status);
    if (input.date_from) p.set("from", input.date_from);
    if (input.date_to) p.set("to", input.date_to);
    const res = await fetch(`${baseUrl}/api/appointments?${p}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const appts = json.data ?? [];
    if (!appts.length) return "No appointments found.";
    return JSON.stringify(
      appts.map((a: Record<string, unknown>) => ({
        id: a.id,
        client: (a.profiles as Record<string, unknown>)?.full_name,
        service: (a.services as Record<string, unknown>)?.name,
        starts_at: a.starts_at,
        status: a.status,
      })),
      null,
      2,
    );
  },
  {
    name: "get_all_appointments",
    description:
      "List all appointments across all clients. Supports filtering by client, staff, status, or date range.",
    schema: z.object({
      client_id: z.string().optional().describe("Filter by client profile UUID"),
      staff_profile_id: z.string().optional().describe("Filter by staff profile UUID"),
      status: z.string().optional().describe("Filter by status"),
      date_from: z.string().optional().describe("Filter from date (ISO 8601)"),
      date_to: z.string().optional().describe("Filter to date (ISO 8601)"),
    }),
  },
);

const updateAppointmentStatusTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/appointments/${input.appointment_id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ status: input.status }),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to update: ${json.error ?? res.statusText}`;
    return `Appointment ${input.appointment_id} updated to "${input.status}".`;
  },
  {
    name: "update_appointment_status",
    description:
      "Update the status of any appointment. Valid statuses: pending, confirmed, in_progress, completed, cancelled, no_show.",
    schema: z.object({
      appointment_id: z.string().describe("UUID of the appointment"),
      status: z
        .string()
        .describe("New status: pending | confirmed | in_progress | completed | cancelled | no_show"),
    }),
  },
);

const deleteAppointmentTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/appointments/${input.appointment_id}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to delete: ${json.error ?? res.statusText}`;
    return `Appointment ${input.appointment_id} deleted permanently.`;
  },
  {
    name: "delete_appointment",
    description: "Permanently delete an appointment. Admin only. Ask for confirmation before proceeding.",
    schema: z.object({
      appointment_id: z.string().describe("UUID of the appointment to delete"),
    }),
  },
);

export const customerAppointmentTools = [getMyAppointmentsTool, bookAppointmentTool, cancelAppointmentTool];
export const staffAppointmentTools = [
  getMyAppointmentsTool,
  bookAppointmentForClientTool,
  cancelAppointmentTool,
  getAllAppointmentsTool,
  updateAppointmentStatusTool,
];
export const adminAppointmentTools = [...staffAppointmentTools, deleteAppointmentTool];
