"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { notificationsService } from "@/services/notifications.service";
import { useRealtime } from "./useRealtime";
import { useAuth } from "./useAuth";
import type { Notification } from "@/types/database";

export function useNotifications() {
  const { profile } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.notifications(),
    queryFn: async () => {
      const { data, error } = await notificationsService.getAll(profile!.id);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Notification[];
    },
    enabled: !!profile?.id,
  });

  useRealtime({
    table: "notifications",
    filter: profile?.id ? `profile_id=eq.${profile.id}` : undefined,
    enabled: !!profile?.id,
    onInsert: () => qc.invalidateQueries({ queryKey: QK.notifications() }),
    onUpdate: () => qc.invalidateQueries({ queryKey: QK.notifications() }),
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await notificationsService.markAsRead(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.notifications() }),
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const { error } = await notificationsService.markAllAsRead(profile.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.notifications() }),
  });

  const notifications = (query.data ?? []) as Notification[];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => markAsRead.mutate(id),
    markAllAsRead: () => markAllAsRead.mutate(),
  };
}
