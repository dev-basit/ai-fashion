"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { staffService } from "@/services/staff.service";
import type { StaffProfile } from "@/types/database";

export function useStaff() {
  return useQuery({
    queryKey: QK.staff(),
    queryFn: async () => {
      const { data, error } = await staffService.getAll();
      if (error) throw new Error(error.message);
      return (data ?? []) as StaffProfile[];
    },
  });
}

export function useStaffMember(id: string | null) {
  return useQuery({
    queryKey: QK.staffMember(id ?? ""),
    queryFn: async () => {
      const { data, error } = await staffService.getById(id!);
      if (error) throw new Error(error.message);
      return data as StaffProfile;
    },
    enabled: !!id,
  });
}

export function useStaffByProfile(profileId: string | null) {
  return useQuery({
    queryKey: [...QK.staff(), "profile", profileId],
    queryFn: async () => {
      const { data, error } = await staffService.getByProfileId(profileId!);
      if (error) throw new Error(error.message);
      return (data ?? []) as StaffProfile[];
    },
    enabled: !!profileId,
  });
}

export function useStaffSchedule(staffProfileId: string | null) {
  return useQuery({
    queryKey: QK.staffSchedule(staffProfileId ?? ""),
    queryFn: async () => {
      const { data, error } = await staffService.getSchedule(staffProfileId!);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!staffProfileId,
  });
}

export function useStaffLeaves(staffProfileId: string | null) {
  return useQuery({
    queryKey: QK.staffLeaves(staffProfileId ?? ""),
    queryFn: async () => {
      const { data, error } = await staffService.getLeaves(staffProfileId!);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!staffProfileId,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data, error } = await staffService.create(payload as Parameters<typeof staffService.create>[0]);
      if (error) throw new Error(error.message);
      return data as StaffProfile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.staff() });
    },
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<StaffProfile>) => {
      const { data, error } = await staffService.update(id, payload);
      if (error) throw new Error(error.message);
      return data as StaffProfile;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.staff() });
      qc.invalidateQueries({ queryKey: QK.staffMember(id) });
    },
  });
}

export function useUpsertSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (schedules: Parameters<typeof staffService.upsertSchedule>[0]) => {
      const { data, error } = await staffService.upsertSchedule(schedules);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, schedules) => {
      const staffProfileId = (schedules[0] as { staff_profile_id?: string })?.staff_profile_id ?? "";
      qc.invalidateQueries({ queryKey: QK.staffSchedule(staffProfileId) });
    },
  });
}

export function useCreateLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof staffService.createLeave>[0]) => {
      const { data, error } = await staffService.createLeave(payload);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: QK.staffLeaves(payload.staff_profile_id) });
    },
  });
}

export function useAssignService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ staffProfileId, serviceId }: { staffProfileId: string; serviceId: string }) => {
      const { data, error } = await staffService.assignService(staffProfileId, serviceId);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { staffProfileId }) => {
      qc.invalidateQueries({ queryKey: QK.staffMember(staffProfileId) });
      qc.invalidateQueries({ queryKey: QK.staff() });
    },
  });
}

export function useRemoveService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ staffProfileId, serviceId }: { staffProfileId: string; serviceId: string }) => {
      const { error } = await staffService.removeService(staffProfileId, serviceId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { staffProfileId }) => {
      qc.invalidateQueries({ queryKey: QK.staffMember(staffProfileId) });
      qc.invalidateQueries({ queryKey: QK.staff() });
    },
  });
}

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      const { error } = await staffService.setAvailability(id, isAvailable);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.staff() });
    },
  });
}

export function useDeactivateStaffProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await staffService.deactivateProfile(profileId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.staff() });
      qc.invalidateQueries({ queryKey: QK.profiles() });
    },
  });
}
