"use client";

import { useEffect, useRef } from "react";
import { getBrowserClient } from "@/services/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeOptions {
  table: string;
  schema?: string;
  filter?: string;
  onInsert?: (payload: Record<string, unknown>) => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
  enabled?: boolean;
}

export function useRealtime({
  table,
  schema = "public",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: RealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = getBrowserClient();
    const channelName = `${table}-${filter ?? "all"}-${Date.now()}`;

    channelRef.current = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema, table, filter }, (payload) => {
        if (payload.eventType === "INSERT" && onInsert) onInsert(payload.new as Record<string, unknown>);
        if (payload.eventType === "UPDATE" && onUpdate) onUpdate(payload.new as Record<string, unknown>);
        if (payload.eventType === "DELETE" && onDelete) onDelete(payload.old as Record<string, unknown>);
      })
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [table, schema, filter, enabled]);
}
