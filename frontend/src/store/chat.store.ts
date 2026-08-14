"use client";

import { create } from "zustand";
import type { Conversation, Message } from "@/types/database";

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  typingUsers: Record<string, string[]>;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setUnreadCount: (conversationId: string, count: number) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  setTypingUsers: (conversationId: string, userIds: string[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCounts: {},
  typingUsers: {},

  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((s) => ({
      conversations: [conversation, ...s.conversations.filter((c) => c.id !== conversation.id)],
    })),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (conversationId, messages) =>
    set((s) => ({ messages: { ...s.messages, [conversationId]: messages } })),
  addMessage: (conversationId, message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] ?? []), message],
      },
    })),
  setUnreadCount: (conversationId, count) =>
    set((s) => ({ unreadCounts: { ...s.unreadCounts, [conversationId]: count } })),
  incrementUnread: (conversationId) =>
    set((s) => ({
      unreadCounts: { ...s.unreadCounts, [conversationId]: (s.unreadCounts[conversationId] ?? 0) + 1 },
    })),
  clearUnread: (conversationId) => set((s) => ({ unreadCounts: { ...s.unreadCounts, [conversationId]: 0 } })),
  setTypingUsers: (conversationId, userIds) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [conversationId]: userIds } })),
}));
