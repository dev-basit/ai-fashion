import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const listStaffTool = tool(
  async (_input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/staff`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const staff = json.data ?? [];
    if (!staff.length) return "No staff members found.";
    return JSON.stringify(
      staff.map((s: Record<string, unknown>) => ({
        staff_profile_id: s.id,
        full_name: (s.profiles as Record<string, unknown>)?.full_name,
        specializations: s.specializations,
        is_active: s.is_active,
      })),
      null,
      2,
    );
  },
  {
    name: "list_staff",
    description:
      "List all staff members with their profile IDs and specializations. Use this to find a staff profile ID when booking an appointment.",
    schema: z.object({}),
  },
);

const createStaffTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/staff`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to create staff: ${json.error ?? res.statusText}`;
    const s = json.data as Record<string, unknown>;
    return `Staff member "${s.full_name}" created with email ${input.email}.`;
  },
  {
    name: "create_staff",
    description:
      "Create a new staff account. Admin only. Requires email, full_name, and password. Confirm with admin before creating.",
    schema: z.object({
      email: z.string().describe("Staff member's email address"),
      full_name: z.string().describe("Staff member's full name"),
      password: z.string().describe("Initial password"),
      phone: z.string().optional().describe("Staff member's phone number"),
    }),
  },
);

const updateStaffTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const { staff_id, ...body } = input;
    const res = await fetch(`${baseUrl}/api/staff/${staff_id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to update staff: ${json.error ?? res.statusText}`;
    return `Staff member ${staff_id} updated successfully.`;
  },
  {
    name: "update_staff",
    description: "Update a staff member's profile (name, phone, specializations, active status). Admin only.",
    schema: z.object({
      staff_id: z.string().describe("UUID of the staff profile to update"),
      full_name: z.string().optional().describe("New full name"),
      phone: z.string().optional().describe("New phone number"),
      specializations: z.array(z.string()).optional().describe("Updated list of specializations"),
      is_active: z.boolean().optional().describe("Set false to deactivate"),
    }),
  },
);

export const sharedStaffTools = [listStaffTool];
export const adminStaffTools = [...sharedStaffTools, createStaffTool, updateStaffTool];
