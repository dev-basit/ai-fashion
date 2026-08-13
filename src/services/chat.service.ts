import { getBrowserClient } from "./supabase";
import type { Conversation, Message } from "@/types/database";

export const chatService = {
  async getConversations(_profileId: string) {
    const supabase = getBrowserClient();
    // RLS (is_conversation_member) already scopes rows to the current user, so we do
    // NOT filter the embedded participants — we want ALL participants back so the UI
    // can display the *other* person's name.
    void _profileId;
    return supabase
      .from("conversations")
      .select("*, conversation_participants(profile_id, last_read_at, profiles(id, full_name, avatar_url))")
      .order("updated_at", { ascending: false });
  },

  async getOrCreateDirectConversation(profileId1: string, profileId2: string) {
    const supabase = getBrowserClient();
    const { data: existing } = await supabase
      .from("conversation_participants")
      .select("conversation_id, conversations!inner(id, is_group)")
      .eq("profile_id", profileId1)
      .eq("conversations.is_group", false);

    if (existing && existing.length > 0) {
      for (const row of existing) {
        const { data: participant } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("conversation_id", row.conversation_id)
          .eq("profile_id", profileId2)
          .single();
        if (participant) return { data: { id: row.conversation_id }, error: null };
      }
    }

    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({ created_by: profileId1 })
      .select()
      .single();

    if (error || !conv) return { data: null, error };

    const { error: participantsError } = await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, profile_id: profileId1 },
      { conversation_id: conv.id, profile_id: profileId2 },
    ]);

    if (participantsError) return { data: null, error: participantsError };

    return { data: conv, error: null };
  },

  async getMessages(conversationId: string, limit = 50) {
    const supabase = getBrowserClient();
    return supabase
      .from("messages")
      .select("*, profiles!sender_id(id, full_name, avatar_url)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);
  },

  async sendMessage(payload: { conversation_id: string; sender_id: string; content: string }) {
    const supabase = getBrowserClient();
    return supabase
      .from("messages")
      .insert({ ...payload, message_type: "text" as const })
      .select("*, profiles!sender_id(id, full_name, avatar_url)")
      .single();
  },

  async markAsRead(conversationId: string, profileId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("profile_id", profileId);
  },

  async createGroupConversation(title: string, createdBy: string, participantIds: string[]) {
    const supabase = getBrowserClient();
    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({ title, is_group: true, created_by: createdBy })
      .select()
      .single();

    if (error || !conv) return { data: null, error };

    const participants = participantIds.map((pid) => ({ conversation_id: conv.id, profile_id: pid }));
    await supabase.from("conversation_participants").insert(participants);

    return { data: conv, error: null };
  },
};
