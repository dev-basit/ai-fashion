import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const getAppointmentStatsTool = tool(
  async (_input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/appointments/stats`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const d = json.data as Record<string, unknown>;
    return `Today's appointments: ${d.todayCount}, Pending: ${d.pendingCount}, Today's revenue: ${d.todayRevenue}`;
  },
  {
    name: "get_appointment_stats",
    description: "Get today's appointment count, pending count, and revenue. Admin only.",
    schema: z.object({}),
  },
);

export const reportsTools = [getAppointmentStatsTool];
