import { getBrowserClient } from "@/services/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getBrowserClient() as any;

export const aiConversationsService = {
  async getConversations() {
    return db()
      .from("ai_conversations")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false });
  },

  async createConversation(userId: string) {
    return db()
      .from("ai_conversations")
      .insert({ user_id: userId })
      .select("id, title, created_at, updated_at")
      .single();
  },

  async updateTitle(conversationId: string, title: string) {
    return db().from("ai_conversations").update({ title }).eq("id", conversationId);
  },

  async getMessages(conversationId: string) {
    return db()
      .from("ai_messages")
      .select("id, ai_conversation_id, role, content, created_at")
      .eq("ai_conversation_id", conversationId)
      .order("created_at", { ascending: true });
  },

  async deleteConversation(conversationId: string) {
    return db().from("ai_conversations").delete().eq("id", conversationId);
  },
};
