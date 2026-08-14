import { ToolMessage } from "@langchain/core/messages";
import type { AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import { embeddings } from "@/ai/models";
import { matchDocuments } from "@/services/ai.service";
import type { AgentState } from "@/ai/state";

export const retrieveTool = tool(async () => "", {
  name: "retrieve_context",
  description:
    "Search the Glow By Miral knowledge base for information about services, pricing, policies, appointments, products, and other salon-specific topics. Use this whenever you need factual details to answer a question accurately.",
  schema: z.object({
    query: z.string().describe("Specific search query — be precise for better results"),
  }),
});

export async function retrieve(state: AgentState): Promise<Partial<AgentState>> {
  const lastMsg = state.messages.at(-1) as AIMessage;
  const call = lastMsg?.tool_calls?.find((tc) => tc.name === "retrieve_context");
  const query = (call?.args as { query?: string })?.query ?? "";

  const vectors = await embeddings.embedDocuments([query]);
  const chunks = await matchDocuments(vectors[0], state.userRole, 5);
  const context =
    chunks.map((c) => `[${c.section}]\n${c.content}`).join("\n\n") || "No relevant information found.";

  const toolMsg = new ToolMessage({
    content: context,
    tool_call_id: call?.id ?? "retrieve_context",
    name: "retrieve_context",
  });

  return { messages: [toolMsg], context };
}
