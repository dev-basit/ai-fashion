import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const getClientsTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const p = new URLSearchParams();
    if (input.search) p.set("search", input.search);
    const res = await fetch(`${baseUrl}/api/clients?${p}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const clients = json.data ?? [];
    if (!clients.length) return "No clients found.";
    return JSON.stringify(
      clients.map((c: Record<string, unknown>) => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone,
      })),
      null,
      2,
    );
  },
  {
    name: "get_clients",
    description: "List all active clients. Optionally search by name.",
    schema: z.object({
      search: z.string().optional().describe("Search clients by name"),
    }),
  },
);

const getClientTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/clients/${input.client_id}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Client not found: ${json.error ?? res.statusText}`;
    return JSON.stringify(json.data, null, 2);
  },
  {
    name: "get_client",
    description: "Get full profile details for a specific client by their UUID.",
    schema: z.object({
      client_id: z.string().describe("UUID of the client profile"),
    }),
  },
);

const createClientTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/clients`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to create client: ${json.error ?? res.statusText}`;
    const c = json.data as Record<string, unknown>;
    return `Client "${c.full_name}" created with email ${input.email}.`;
  },
  {
    name: "create_client",
    description:
      "Create a new customer account. Admin only. Requires email, full_name, and password. Confirm with admin before creating.",
    schema: z.object({
      email: z.string().describe("Client's email address"),
      full_name: z.string().describe("Client's full name"),
      password: z.string().describe("Initial password"),
      phone: z.string().optional().describe("Client's phone number"),
    }),
  },
);

const updateClientTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const { client_id, ...body } = input;
    const res = await fetch(`${baseUrl}/api/clients/${client_id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to update client: ${json.error ?? res.statusText}`;
    return `Client ${client_id} updated successfully.`;
  },
  {
    name: "update_client",
    description: "Update a client's profile details. Admin or staff can do this.",
    schema: z.object({
      client_id: z.string().describe("UUID of the client profile"),
      full_name: z.string().optional().describe("New full name"),
      phone: z.string().optional().describe("New phone number"),
      is_active: z.boolean().optional().describe("Set false to deactivate the account"),
    }),
  },
);

export const staffClientTools = [getClientsTool, getClientTool, updateClientTool];
export const adminClientTools = [...staffClientTools, createClientTool];
