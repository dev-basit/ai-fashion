"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getBrowserClient } from "@/services/supabase";
import { profilesService } from "@/services/profiles.service";
import type { AuthState } from "@/types/auth";
import type { Profile } from "@/types/database";
import type { Session, User } from "@supabase/supabase-js";

interface AuthStore extends AuthState {
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,

      setSession: (session) => set({ session, user: session?.user ?? null }),
      setProfile: (profile) => set({ profile }),

      signIn: async (email, password) => {
        const supabase = getBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
      },

      signOut: async () => {
        const supabase = getBrowserClient();
        await supabase.auth.signOut();
        set({ user: null, session: null, profile: null });
      },

      fetchProfile: async (userId: string) => {
        const { data } = await profilesService.getById(userId);
        if (data) set({ profile: data });
      },

      initialize: async () => {
        const supabase = getBrowserClient();
        set({ isLoading: true });

        const {
          data: { session },
        } = await supabase.auth.getSession();

        set({ session, user: session?.user ?? null, isLoading: false });

        if (session?.user) {
          const { data } = await profilesService.getById(session.user.id);
          if (data) set({ profile: data });
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
          set({ session, user: session?.user ?? null });
          if (session?.user) {
            const { data } = await profilesService.getById(session.user.id);
            if (data) set({ profile: data });
          } else {
            set({ profile: null });
          }
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
