import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const getMyTreatmentPlansTool = tool(
  async (_input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/treatment-plans`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const plans = json.data ?? [];
    if (!plans.length) return "You have no treatment plans.";
    return JSON.stringify(
      plans.map((p: Record<string, unknown>) => ({
        id: p.id,
        template: (p.treatment_plan_templates as Record<string, unknown>)?.name,
        status: p.status,
        start_date: p.start_date,
        end_date: p.end_date,
      })),
      null,
      2,
    );
  },
  {
    name: "get_my_treatment_plans",
    description: "Get the current customer's own assigned treatment plans.",
    schema: z.object({}),
  },
);

const getTreatmentPlansTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const p = new URLSearchParams();
    if (input.client_id) p.set("clientId", input.client_id);
    const res = await fetch(`${baseUrl}/api/treatment-plans?${p}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const plans = json.data ?? [];
    if (!plans.length) return "No treatment plans found.";
    return JSON.stringify(
      plans.map((p: Record<string, unknown>) => ({
        id: p.id,
        client: (p.profiles as Record<string, unknown>)?.full_name,
        template: (p.treatment_plan_templates as Record<string, unknown>)?.name,
        status: p.status,
        start_date: p.start_date,
      })),
      null,
      2,
    );
  },
  {
    name: "get_treatment_plans",
    description: "List treatment plans. Optionally filter by client.",
    schema: z.object({
      client_id: z.string().optional().describe("Filter by client profile UUID"),
    }),
  },
);

const assignTreatmentPlanTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/treatment-plans`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to assign plan: ${json.error ?? res.statusText}`;
    return `Treatment plan assigned to client ${input.client_id} successfully.`;
  },
  {
    name: "assign_treatment_plan",
    description:
      "Assign a treatment plan to a client. Staff and admin only. Use list_treatment_plan_templates to find valid template IDs.",
    schema: z.object({
      client_id: z.string().describe("UUID of the client to assign the plan to"),
      template_id: z.string().optional().describe("UUID of the treatment plan template"),
      start_date: z.string().optional().describe("Plan start date (YYYY-MM-DD)"),
      notes: z.string().optional().describe("Additional notes for the plan"),
    }),
  },
);

const listTreatmentPlanTemplatesTool = tool(
  async (_input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/treatment-plans/templates`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const templates = json.data ?? [];
    if (!templates.length) return "No treatment plan templates found.";
    return JSON.stringify(
      templates.map((t: Record<string, unknown>) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        duration_days: t.duration_days,
      })),
      null,
      2,
    );
  },
  {
    name: "list_treatment_plan_templates",
    description: "List all available treatment plan templates.",
    schema: z.object({}),
  },
);

const createTreatmentPlanTemplateTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/treatment-plans/templates`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to create template: ${json.error ?? res.statusText}`;
    return `Treatment plan template "${input.name}" created successfully.`;
  },
  {
    name: "create_treatment_plan_template",
    description: "Create a new treatment plan template. Admin only.",
    schema: z.object({
      name: z.string().describe("Template name"),
      description: z.string().optional().describe("Template description"),
      duration_days: z.number().optional().describe("Duration of the plan in days"),
    }),
  },
);

export const customerTreatmentPlanTools = [getMyTreatmentPlansTool, listTreatmentPlanTemplatesTool];
export const staffTreatmentPlanTools = [
  ...customerTreatmentPlanTools,
  getTreatmentPlansTool,
  assignTreatmentPlanTool,
];
export const adminTreatmentPlanTools = [...staffTreatmentPlanTools, createTreatmentPlanTemplateTool];
