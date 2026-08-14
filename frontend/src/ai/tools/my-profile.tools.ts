import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";
import { env } from "@/config/env";

const getMyProfileTool = tool(
  async (_input, config: RunnableConfig | undefined) => {
    const { accessToken } = toolCtx(config);
    const baseUrl = env.app.url;
    const res = await fetch(`${baseUrl}/api/me`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    return JSON.stringify(json.data, null, 2);
  },
  {
    name: "get_my_profile",
    description:
      "Get the current logged-in user's own profile details (name, email, phone, role, etc.). Never returns another user's data.",
    schema: z.object({}),
  },
);

export const myProfileTools = [getMyProfileTool];
