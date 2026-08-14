import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const listServicesTool = tool(
  async (_input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/services`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const services = json.data ?? [];
    if (!services.length) return "No services available.";
    return JSON.stringify(
      services.map((s: Record<string, unknown>) => ({
        id: s.id,
        name: s.name,
        category: (s.service_categories as Record<string, unknown>)?.name,
        base_price: s.base_price,
        duration_minutes: s.duration_minutes,
        variants: ((s.service_variants as Record<string, unknown>[]) ?? []).map((v) => ({
          id: v.id,
          name: v.name,
          price_modifier: v.price_modifier,
          duration_modifier: v.duration_modifier,
        })),
      })),
      null,
      2,
    );
  },
  {
    name: "list_services",
    description:
      "List all active services with their categories, pricing, duration, and variants. Use this to find valid service IDs for booking.",
    schema: z.object({}),
  },
);

const createServiceTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/services`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to create service: ${json.error ?? res.statusText}`;
    return `Service "${input.name}" created successfully.`;
  },
  {
    name: "create_service",
    description: "Create a new service. Admin only. Confirm details with the admin before creating.",
    schema: z.object({
      name: z.string().describe("Service name"),
      description: z.string().optional().describe("Service description"),
      base_price: z.number().describe("Base price in the app's currency"),
      duration_minutes: z.number().describe("Service duration in minutes"),
      category_id: z.string().optional().describe("UUID of the service category"),
    }),
  },
);

const updateServiceTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const { service_id, ...body } = input;
    const res = await fetch(`${baseUrl}/api/services/${service_id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to update service: ${json.error ?? res.statusText}`;
    return `Service ${service_id} updated successfully.`;
  },
  {
    name: "update_service",
    description: "Update an existing service. Admin only. Use list_services to find the service ID.",
    schema: z.object({
      service_id: z.string().describe("UUID of the service to update"),
      name: z.string().optional().describe("New name"),
      description: z.string().optional().describe("New description"),
      base_price: z.number().optional().describe("New base price"),
      duration_minutes: z.number().optional().describe("New duration in minutes"),
      is_active: z.boolean().optional().describe("Set false to deactivate the service"),
    }),
  },
);

export const sharedServiceTools = [listServicesTool];
export const adminServiceTools = [...sharedServiceTools, createServiceTool, updateServiceTool];
