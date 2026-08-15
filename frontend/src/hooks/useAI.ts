"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiConversationsService } from "@/services/ai-conversations.service";
import { QK } from "@/config/query";
import { toAIChatMessage } from "@/lib/utils";
import type { AiConversation, AiMessage } from "@/types/database";
import type { AIChatMessage } from "@/types/props";

export function useAIConversations() {
  return useQuery({
    queryKey: QK.aiConversations(),
    queryFn: async () => {
      const { data, error } = await aiConversationsService.getConversations();
      if (error) throw new Error(error.message);
      return (data ?? []) as AiConversation[];
    },
  });
}

export function useAIMessages(conversationId: string | null) {
  return useQuery({
    queryKey: QK.aiMessages(conversationId ?? ""),
    queryFn: async () => {
      const { data, error } = await aiConversationsService.getMessages(conversationId!);
      if (error) throw new Error(error.message);
      return ((data ?? []) as AiMessage[]).map(toAIChatMessage) as AIChatMessage[];
    },
    enabled: !!conversationId,
  });
}

export function useCreateAIConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await aiConversationsService.createConversation();
      if (error) throw new Error(error.message);
      return data as AiConversation;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.aiConversations() }),
  });
}

export function useDeleteAIConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await aiConversationsService.deleteConversation(conversationId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.aiConversations() }),
  });
}
