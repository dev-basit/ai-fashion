"use client";

import { create } from "zustand";

interface AIStore {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));
