import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const getSettingsTool = tool(
  async (_input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/settings`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    return JSON.stringify(json.data, null, 2);
  },
  {
    name: "get_settings",
    description: "Get current business settings (name, contact details, working hours, booking rules). Admin only.",
    schema: z.object({}),
  },
);

const updateSettingsTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/settings`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to update settings: ${json.error ?? res.statusText}`;
    return "Business settings updated successfully.";
  },
  {
    name: "update_settings",
    description:
      "Update business settings. Admin only. Only pass the fields that need to change. Confirm with admin before updating.",
    schema: z.object({
      business_name: z.string().optional().describe("Business name"),
      contact_email: z.string().optional().describe("Contact email"),
      contact_phone: z.string().optional().describe("Contact phone number"),
      address: z.string().optional().describe("Business address"),
      working_hours: z.record(z.string(), z.unknown()).optional().describe("Working hours object"),
    }),
  },
);

export const settingsTools = [getSettingsTool, updateSettingsTool];
