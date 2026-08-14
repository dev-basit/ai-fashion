"use client";

import { useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrowserClient } from "@/services/supabase";
import { chatService } from "@/services/chat.service";
import { useChatStore } from "@/store/chat.store";
import { useAuth } from "./useAuth";
import { QK } from "@/config/query";
import type { Conversation, Message } from "@/types/database";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useChatRecipients() {
  return useQuery({
    queryKey: QK.chatRecipients(),
    queryFn: async () => {
      const { data, error } = await chatService.getRecipients();
      if (error) throw new Error(error.message);
      return (data ?? []) as import("@/types/database").Profile[];
    },
  });
}

export function useConversations() {
  const { profile } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.chatConversations(),
    queryFn: async () => {
      const { data, error } = await chatService.getConversations(profile!.id);
      if (error) throw new Error(error.message);
      return (data ?? []) as Conversation[];
    },
    enabled: !!profile?.id,
  });

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    refetch: () => qc.invalidateQueries({ queryKey: QK.chatConversations() }),
  };
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recipientId: string) => {
      const { data, error } = await chatService.getOrCreateDirectConversation("", recipientId);
      if (error) throw new Error(error.message);
      return data as Conversation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.chatConversations() });
    },
  });
}

export function useMessages(conversationId: string | null) {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { activeConversationId } = useChatStore();

  const query = useQuery({
    queryKey: QK.chatMessages(conversationId ?? ""),
    queryFn: async () => {
      const { data, error } = await chatService.getMessages(conversationId!);
      if (error) throw new Error(error.message);
      return (data ?? []) as Message[];
    },
    enabled: !!conversationId,
  });

  // Realtime subscription — invalidates the messages query on new inserts
  useEffect(() => {
    if (!conversationId) return;

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
        (payload) => {
          const newMessage = payload.new as Message;
          // Skip own messages — already added optimistically via mutation
          if (newMessage.sender_id !== profile?.id) {
            qc.invalidateQueries({ queryKey: QK.chatMessages(conversationId) });
          }
          qc.invalidateQueries({ queryKey: QK.chatConversations() });
        },
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId || !profile?.id) throw new Error("Not ready");
      const { data, error } = await chatService.sendMessage({
        conversation_id: conversationId,
        sender_id: profile.id,
        content,
      });
      if (error) throw new Error(error.message);
      return data as Message;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.chatMessages(conversationId ?? "") });
      qc.invalidateQueries({ queryKey: QK.chatConversations() });
    },
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    sendMessage: (content: string) => sendMessage.mutate(content),
    isSending: sendMessage.isPending,
    activeConversationId,
  };
}
