import type { RunnableConfig } from "@langchain/core/runnables";

export function toolCtx(config: RunnableConfig | undefined) {
  const { accessToken = "", baseUrl = "" } = (config?.configurable ?? {}) as Record<string, string>;
  return { accessToken, baseUrl };
}

export function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}
