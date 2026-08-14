import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const getMyConsultationRecordsTool = tool(
  async (_input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/consultation/records`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const records = json.data ?? [];
    if (!records.length) return "You have no consultation records.";
    return JSON.stringify(
      records.map((r: Record<string, unknown>) => ({
        id: r.id,
        template: (r.consultation_form_templates as Record<string, unknown>)?.name,
        notes: r.notes,
        created_at: r.created_at,
      })),
      null,
      2,
    );
  },
  {
    name: "get_my_consultation_records",
    description: "Get the current customer's own consultation records.",
    schema: z.object({}),
  },
);

const getConsultationRecordsTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const p = new URLSearchParams();
    if (input.client_id) p.set("clientId", input.client_id);
    const res = await fetch(`${baseUrl}/api/consultation/records?${p}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const records = json.data ?? [];
    if (!records.length) return "No consultation records found.";
    return JSON.stringify(
      records.map((r: Record<string, unknown>) => ({
        id: r.id,
        client: (r.profiles as Record<string, unknown>)?.full_name,
        template: (r.consultation_form_templates as Record<string, unknown>)?.name,
        notes: r.notes,
        created_at: r.created_at,
      })),
      null,
      2,
    );
  },
  {
    name: "get_consultation_records",
    description: "List consultation records. Optionally filter by a specific client.",
    schema: z.object({
      client_id: z.string().optional().describe("Filter by client profile UUID"),
    }),
  },
);

const createConsultationRecordTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/consultation/records`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to create record: ${json.error ?? res.statusText}`;
    return `Consultation record created successfully for client ${input.client_id}.`;
  },
  {
    name: "create_consultation_record",
    description: "Create a consultation record for a client. Staff and admin only. Ask for all details before creating.",
    schema: z.object({
      client_id: z.string().describe("UUID of the client"),
      template_id: z.string().optional().describe("UUID of the consultation form template"),
      notes: z.string().optional().describe("Session notes and observations"),
      recommendations: z.string().optional().describe("Recommended treatments or products"),
    }),
  },
);

export const customerConsultationTools = [getMyConsultationRecordsTool];
export const staffConsultationTools = [...customerConsultationTools, getConsultationRecordsTool, createConsultationRecordTool];
