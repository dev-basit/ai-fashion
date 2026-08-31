"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { API_ROUTES } from "@/config/constants";
import { clientsService } from "@/services/clients.service";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import type { Profile } from "@/types/database";

export function useClients(search?: string) {
  return useQuery({
    queryKey: QK.clients(search),
    queryFn: async () => {
      const { data, error } = await clientsService.getAll(search);
      if (error) throw new Error(error.message);
      return (data ?? []) as Profile[];
    },
  });
}

export function useClient(id: string | null) {
  return useQuery({
    queryKey: QK.client(id ?? ""),
    queryFn: async () => {
      const { data, error } = await clientsService.getById(id!);
      if (error) throw new Error(error.message);
      return data as Profile;
    },
    enabled: !!id,
  });
}

export function useClientHistory(id: string | null) {
  return useQuery({
    queryKey: QK.clientHistory(id ?? ""),
    queryFn: async () => {
      const { data, error } = await clientsService.getClientHistory(id!);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
}

export function useClientAppointmentCounts() {
  return useQuery({
    queryKey: QK.clientCounts(),
    queryFn: async () => {
      const { data, error } = await clientsService.getAppointmentCountsByClient();
      if (error) throw new Error(error.message);
      return (data ?? {}) as Record<string, number>;
    },
  });
}

// Client creation involves Supabase auth user creation — not safe to queue offline
export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data, error } = await clientsService.create(payload as Parameters<typeof clientsService.create>[0]);
      if (error) throw new Error(error.message);
      return data as Profile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.clients() });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Profile>) => {
      const { data, error } = await clientsService.update(id, payload);
      if (error) throw new Error(error.message);
      return data as Profile;
    },
    getQueueEntry: ({ id, ...payload }) => ({
      method: "PATCH",
      url: API_ROUTES.clientById(id),
      payload,
      label: "Client",
      invalidateKeys: [QK.clients(), QK.client(id)],
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.clients() });
      qc.invalidateQueries({ queryKey: QK.client(id) });
    },
  });
}

export function useDeactivateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await clientsService.deactivate(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.clients() });
    },
  });
}
