"use client";

import { useCallback, useEffect, useRef } from "react";
import { getBrowserClient } from "@/services/supabase";
import { chatService } from "@/services/chat.service";
import { useChatStore } from "@/store/chat.store";
import { useAuth } from "./useAuth";
import type { Message, Conversation } from "@/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useConversations() {
  const { profile } = useAuth();
  const { conversations, setConversations } = useChatStore();

  const refetch = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await chatService.getConversations(profile.id);
    if (data) setConversations(data as Conversation[]);
  }, [profile?.id, setConversations]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { conversations, refetch };
}

export function useMessages(conversationId: string | null) {
  const { profile } = useAuth();
  const { messages, setMessages, addMessage } = useChatStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const { data } = await chatService.getMessages(conversationId);
        if (data) setMessages(conversationId, data as Message[]);
      } catch { /* ignore */ }
    };
    loadMessages();

    const supabase = getBrowserClient();
    channelRef.current = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id !== profile?.id) {
            const { data } = await supabase
              .from("messages")
              .select("*, profiles!sender_id(id, full_name, avatar_url)")
              .eq("id", newMessage.id)
              .single();
            if (data) addMessage(conversationId, data as Message);
          }
        },
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !profile?.id) return;
    const { data } = await chatService.sendMessage({
      conversation_id: conversationId,
      sender_id: profile.id,
      content,
    });
    if (data) addMessage(conversationId, data as Message);
  };

  return {
    messages: messages[conversationId ?? ""] ?? [],
    sendMessage,
  };
}
