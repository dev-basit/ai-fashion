"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { API_ROUTES } from "@/config/constants";
import { settingsService } from "@/services/settings.service";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";

export function useSetting(key: string) {
  return useQuery({
    queryKey: QK.settings(key),
    queryFn: async () => {
      const { data, error } = await settingsService.get(key);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!key,
  });
}

export function useAllSettings() {
  return useQuery({
    queryKey: QK.settings(),
    queryFn: async () => {
      const { data, error } = await settingsService.getAll();
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { data, error } = await settingsService.update(key, value as Record<string, unknown>);
      if (error) throw new Error(error.message);
      return data;
    },
    getQueueEntry: ({ key, value }) => ({
      method: "PATCH",
      url: API_ROUTES.settings,
      payload: { key, value },
      label: "Setting",
      invalidateKeys: [QK.settings(key), QK.settings()],
    }),
    onSuccess: (_, { key }) => {
      qc.invalidateQueries({ queryKey: QK.settings(key) });
      qc.invalidateQueries({ queryKey: QK.settings() });
    },
  });
}
