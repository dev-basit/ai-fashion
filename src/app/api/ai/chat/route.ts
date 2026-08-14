import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";
import { graph } from "@/ai/graph";
import { env } from "@/config/env";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { BaseMessageChunk } from "@langchain/core/messages";

export const POST = withAuth(async (req, { user, supabase }) => {
  const body = await req.json();
  const message: string = body.message ?? "";
  const conversationId: string = body.conversationId ?? "";
  const timezone: string = body.timezone;

  if (!message.trim()) return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any;

  // Get user role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const userRole = profile?.role as string;

  // Rate limit check
  const today = new Date().toISOString().split("T")[0];
  const { data: usageRow } = await db
    .from("ai_usage")
    .select("call_count")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  const callCount: number = usageRow?.call_count ?? 0;

  if (callCount >= env.ai.dailyLimit) {
    return NextResponse.json(
      {
        error: "rate_limit",
        message: `You've reached your daily limit of ${env.ai.dailyLimit} AI calls. Resets at midnight.`,
        limit: env.ai.dailyLimit,
        remaining: 0,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(env.ai.dailyLimit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // Verify conversation ownership
  const { data: conv } = await db
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  // Load history from DB
  const { data: historyRows } = await db
    .from("ai_messages")
    .select("role, content")
    .eq("ai_conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const history: { role: "user" | "assistant"; content: string }[] = historyRows ?? [];

  // Increment rate limit before streaming
  await db
    .from("ai_usage")
    .upsert({ user_id: user.id, date: today, call_count: callCount + 1 }, { onConflict: "user_id,date" });

  // Save user message immediately
  await db.from("ai_messages").insert({ ai_conversation_id: conversationId, role: "user", content: message });

  // Auto-title on first message in this conversation
  if (history.length === 0) {
    const title = message.slice(0, 50).trim();
    await db.from("ai_conversations").update({ title }).eq("id", conversationId);
  }

  // Build LangGraph message list from DB history + current message
  const messages = [
    ...history.map((m) => (m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content))),
    new HumanMessage(message),
  ];

  const remaining = env.ai.dailyLimit - (callCount + 1);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullResponse = "";

      try {
        const agentStream = await graph.stream(
          { messages, userRole, context: "" },
          {
            streamMode: "messages",
            configurable: { accessToken: session?.access_token ?? "", baseUrl: env.app.url, timezone },
          },
        );
        for await (const chunk of agentStream) {
          const [msgChunk, meta] = chunk as [BaseMessageChunk, { langgraph_node?: string }];
          if (meta?.langgraph_node === "agent" && typeof msgChunk.content === "string") {
            fullResponse += msgChunk.content;
            controller.enqueue(encoder.encode(msgChunk.content));
          }
        }
      } catch (err) {
        console.error("Agent stream error:", err);
        const errMsg = "Sorry, something went wrong. Please try again.";
        fullResponse = errMsg;
        controller.enqueue(encoder.encode(errMsg));
      } finally {
        // Save full assistant response after streaming completes
        if (fullResponse) {
          await db
            .from("ai_messages")
            .insert({ ai_conversation_id: conversationId, role: "assistant", content: fullResponse });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-RateLimit-Limit": String(env.ai.dailyLimit),
      "X-RateLimit-Remaining": String(remaining),
    },
  }) as unknown as NextResponse;
});
