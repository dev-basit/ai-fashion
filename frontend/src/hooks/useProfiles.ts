"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { API_ROUTES } from "@/config/constants";
import { profilesService } from "@/services/profiles.service";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import type { Profile } from "@/types/database";

export function useAllProfiles() {
  return useQuery({
    queryKey: QK.profiles(),
    queryFn: async () => {
      const { data, error } = await profilesService.getAll();
      if (error) throw new Error(error.message);
      return (data ?? []) as Profile[];
    },
  });
}

export function useProfile(id: string | null) {
  return useQuery({
    queryKey: QK.profile(id ?? ""),
    queryFn: async () => {
      const { data, error } = await profilesService.getById(id!);
      if (error) throw new Error(error.message);
      return data as Profile;
    },
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Parameters<typeof profilesService.update>[1]) => {
      const { data, error } = await profilesService.update(
        id,
        updates as Parameters<typeof profilesService.update>[1],
      );
      if (error) throw new Error(error.message);
      return data as Profile;
    },
    getQueueEntry: ({ id, ...updates }) => ({
      method: "PATCH",
      url: API_ROUTES.profileById(id),
      payload: updates,
      label: "Profile",
      invalidateKeys: [QK.profiles(), QK.profile(id)],
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.profiles() });
      qc.invalidateQueries({ queryKey: QK.profile(id) });
    },
  });
}
