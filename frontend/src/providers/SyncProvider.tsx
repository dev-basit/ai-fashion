"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";

export function SyncProvider() {
  useOfflineSync();
  return null;
}
