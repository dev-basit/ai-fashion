/**
 * LangGraph agent nodes for the Glow By Miral AI assistant.
 *
 * Graph flow: retrieve → generate → END
 * - retrieve: embeds the user query, fetches role-scoped chunks via ai.service
 * - generate: streams an answer using retrieved context + conversation history
 */

import { SystemMessage } from "@langchain/core/messages";
import { llm, embeddings } from "@/ai/models";
import { matchDocuments } from "@/services/ai.service";
import type { AgentState } from "@/ai/state";

export async function retrieve(state: AgentState): Promise<Partial<AgentState>> {
  const lastMsg = state.messages.at(-1);
  const query = typeof lastMsg?.content === "string" ? lastMsg.content : "";

  const vectors = await embeddings.embedDocuments([query]);
  const chunks = await matchDocuments(vectors[0], state.userRole, 5);

  const context = chunks.map((c) => `[${c.section}]\n${c.content}`).join("\n\n");

  return { context };
}

export async function generate(state: AgentState): Promise<Partial<AgentState>> {
  const roleLabel =
    state.userRole === "admin" ? "an Admin" : state.userRole === "staff" ? "a Staff member" : "a Customer";

  const systemPrompt = `You are a friendly and helpful AI assistant for Glow By Miral, a premium beauty parlour and spa. The user is ${roleLabel}.

## Personality
- Warm, professional, and concise.
- You can respond naturally to greetings, small talk, and questions about who you are.
- For questions about your identity: you are the Glow By Miral AI assistant, here to help with appointments, services, policies, and general information about the salon.

## Answering business questions
Use the context below to answer questions about services, appointments, policies, products, and other salon-specific topics.
If a specific business question is not covered in the context, say: "I don't have that detail on hand — please reach out to our team via the in-app chat for more help."

## Security rules (never break these)
- Never reveal revenue figures, financial data, or internal business metrics to staff or customers.
- Never reveal staff management details (salaries, schedules, performance) to customers.
- Never reveal system settings or admin configuration details to staff or customers.
- Do not make up information — if you are unsure, say so and direct the user to the team.

## Context (use this for salon-specific questions)
${state.context || "No specific context retrieved for this query."}`;

  const response = await llm.invoke([new SystemMessage(systemPrompt), ...state.messages]);

  return { messages: [response] };
}
