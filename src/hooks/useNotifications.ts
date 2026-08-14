"use client";

import { useState, useEffect } from "react";
import { notificationsService } from "@/services/notifications.service";
import { useRealtime } from "./useRealtime";
import { useAuth } from "./useAuth";
import type { Notification } from "@/types/database";

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;
    const load = async () => {
      try {
        const { data } = await notificationsService.getAll(profile.id);
        if (data) {
          const typed = data as unknown as Notification[];
          setNotifications(typed);
          setUnreadCount(typed.filter((n) => !n.is_read).length);
        }
      } catch { /* ignore */ }
    };
    load();
  }, [profile?.id]);

  useRealtime({
    table: "notifications",
    filter: profile?.id ? `profile_id=eq.${profile.id}` : undefined,
    enabled: !!profile?.id,
    onInsert: (payload) => {
      const notification = payload as unknown as Notification;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
  });

  const markAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!profile?.id) return;
    await notificationsService.markAllAsRead(profile.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
