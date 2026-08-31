"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { enqueueAction } from "@/lib/offline-queue";
import type { QueuedAction } from "@/lib/offline-queue";

type QueueEntry = Omit<QueuedAction, "id" | "createdAt">;

interface UseOfflineMutationOptions<TData, TVariables> {
  mutationFn: (vars: TVariables) => Promise<TData>;
  getQueueEntry: (vars: TVariables) => QueueEntry;
  onSuccess?: (data: TData, vars: TVariables) => void;
  onError?: (error: Error, vars: TVariables) => void;
}

// Custom mutateAsync intercepts BEFORE TanStack Query when offline or when the
// network call fails with a connectivity error. In those cases it queues to
// IndexedDB and returns null so the component's await resolves immediately
// (closing modals, resetting forms) without waiting for a server round-trip.
export function useOfflineMutation<TData, TVariables>({
  mutationFn,
  getQueueEntry,
  onSuccess,
  onError,
}: UseOfflineMutationOptions<TData, TVariables>) {
  const mutation = useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess,
    onError: onError ? (error, vars) => onError(error, vars) : undefined,
  });

  const mutateAsync = async (vars: TVariables): Promise<TData | null> => {
    // Definitely offline — skip the network call entirely
    if (!navigator.onLine) {
      await enqueueAction({ id: crypto.randomUUID(), createdAt: Date.now(), ...getQueueEntry(vars) });
      toast.info("Saved locally — will sync when online");
      return null;
    }

    // Attempt the real call; fall back to queue on network-level failures
    try {
      return await mutation.mutateAsync(vars);
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueAction({ id: crypto.randomUUID(), createdAt: Date.now(), ...getQueueEntry(vars) });
        toast.info("Saved locally — will sync when online");
        return null;
      }
      throw err; // 4xx / validation errors — let the form show them
    }
  };

  return { ...mutation, mutateAsync };
}

// True for connectivity-level failures (no response received).
// False when the server responded with an HTTP error (4xx, 5xx).
function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const e = err as Error & { code?: string; response?: unknown; isAxiosError?: boolean };
  if (e.isAxiosError && !e.response) return true;
  if (e.code === "ERR_NETWORK" || e.code === "ECONNABORTED" || e.code === "ERR_CANCELED") return true;
  const msg = e.message.toLowerCase();
  return msg === "network error" || msg.includes("timeout") || msg.includes("failed to fetch");
}
