import { getBrowserClient } from "./supabase";
import type { Notification, NotificationType } from "@/types/database";

export const notificationsService = {
  async getAll(profileId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50);
  },

  async getUnreadCount(profileId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("is_read", false);
  },

  async markAsRead(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("notifications").update({ is_read: true }).eq("id", id);
  },

  async markAllAsRead(profileId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", profileId)
      .eq("is_read", false);
  },

  async create(payload: {
    profile_id: string;
    type: NotificationType;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
  }) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("notifications")
      .insert(payload as any)
      .select()
      .single();
  },
};
