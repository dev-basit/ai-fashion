"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { treatmentPlansService } from "@/services/treatment-plans.service";
import type { TreatmentPlanTemplate, ClientTreatmentPlan } from "@/types/database";

export function useTreatmentPlanTemplates() {
  return useQuery({
    queryKey: QK.treatmentPlans.templates(),
    queryFn: async () => {
      const { data, error } = await treatmentPlansService.getTemplates();
      if (error) throw new Error(error.message);
      return (data ?? []) as TreatmentPlanTemplate[];
    },
  });
}

export function useTreatmentPlanTemplate(id: string | null) {
  return useQuery({
    queryKey: QK.treatmentPlans.template(id ?? ""),
    queryFn: async () => {
      const { data, error } = await treatmentPlansService.getTemplateById(id!);
      if (error) throw new Error(error.message);
      return data as TreatmentPlanTemplate;
    },
    enabled: !!id,
  });
}

export function useClientTreatmentPlans(filters?: { clientId?: string; staffProfileId?: string }) {
  return useQuery({
    queryKey: QK.treatmentPlans.client(filters),
    queryFn: async () => {
      const { data, error } = await treatmentPlansService.getClientPlans(filters);
      if (error) throw new Error(error.message);
      return (data ?? []) as ClientTreatmentPlan[];
    },
  });
}

export function useClientTreatmentPlan(id: string | null) {
  return useQuery({
    queryKey: QK.treatmentPlans.clientById(id ?? ""),
    queryFn: async () => {
      const { data, error } = await treatmentPlansService.getClientPlanById(id!);
      if (error) throw new Error(error.message);
      return data as ClientTreatmentPlan;
    },
    enabled: !!id,
  });
}

export function useCreateTreatmentPlanTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof treatmentPlansService.createTemplate>[0]) => {
      const { data, error } = await treatmentPlansService.createTemplate(payload);
      if (error) throw new Error(error.message);
      return data as TreatmentPlanTemplate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.treatmentPlans.templates() });
    },
  });
}

export function useUpdateTreatmentPlanTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Parameters<typeof treatmentPlansService.updateTemplate>[1]) => {
      const { data, error } = await treatmentPlansService.updateTemplate(id, payload as Parameters<typeof treatmentPlansService.updateTemplate>[1]);
      if (error) throw new Error(error.message);
      return data as TreatmentPlanTemplate;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.treatmentPlans.templates() });
      qc.invalidateQueries({ queryKey: QK.treatmentPlans.template(id) });
    },
  });
}

export function useCreateClientTreatmentPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof treatmentPlansService.createClientPlan>[0]) => {
      const { data, error } = await treatmentPlansService.createClientPlan(payload);
      if (error) throw new Error(error.message);
      return data as ClientTreatmentPlan;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.treatmentPlans.client() });
    },
  });
}

export function useUpdateClientTreatmentPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Parameters<typeof treatmentPlansService.updateClientPlan>[1]) => {
      const { data, error } = await treatmentPlansService.updateClientPlan(id, payload as Parameters<typeof treatmentPlansService.updateClientPlan>[1]);
      if (error) throw new Error(error.message);
      return data as ClientTreatmentPlan;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.treatmentPlans.client() });
      qc.invalidateQueries({ queryKey: QK.treatmentPlans.clientById(id) });
    },
  });
}
