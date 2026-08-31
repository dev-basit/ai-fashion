"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllActions, removeAction } from "@/lib/offline-queue";
import http from "@/services/http";

export function useOfflineSync() {
  const qc = useQueryClient();

  useEffect(() => {
    async function processQueue() {
      const actions = await getAllActions();
      if (actions.length === 0) return;

      const toastId = toast.loading(`Syncing ${actions.length} queued action(s)...`);
      let succeeded = 0;
      const keysToInvalidate: unknown[][] = [];

      for (const action of actions) {
        try {
          await http({ method: action.method, url: action.url, data: action.payload });
          await removeAction(action.id);
          succeeded++;
          action.invalidateKeys.forEach((k) => keysToInvalidate.push(k));
        } catch {
          // Stays in queue — retried on next reconnect
        }
      }

      const unique = Array.from(new Set(keysToInvalidate.map((k) => JSON.stringify(k)))).map((s) =>
        JSON.parse(s) as unknown[],
      );
      for (const key of unique) {
        qc.invalidateQueries({ queryKey: key });
      }

      const failed = actions.length - succeeded;
      if (failed === 0) {
        toast.success(`${succeeded} action(s) synced successfully`, { id: toastId });
      } else {
        toast.warning(`${succeeded} synced, ${failed} failed — will retry later`, { id: toastId });
      }
    }

    window.addEventListener("online", processQueue);
    return () => window.removeEventListener("online", processQueue);
  }, [qc]);
}
