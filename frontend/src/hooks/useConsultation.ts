"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { API_ROUTES } from "@/config/constants";
import { consultationService } from "@/services/consultation.service";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import type { ConsultationFormTemplate, ConsultationRecord } from "@/types/database";

export function useConsultationTemplates() {
  return useQuery({
    queryKey: QK.consultation.templates(),
    queryFn: async () => {
      const { data, error } = await consultationService.getTemplates();
      if (error) throw new Error(error.message);
      return (data ?? []) as ConsultationFormTemplate[];
    },
  });
}

export function useConsultationTemplate(id: string | null) {
  return useQuery({
    queryKey: QK.consultation.template(id ?? ""),
    queryFn: async () => {
      const { data, error } = await consultationService.getTemplateById(id!);
      if (error) throw new Error(error.message);
      return data as ConsultationFormTemplate;
    },
    enabled: !!id,
  });
}

export function useConsultationRecords(filters?: { clientId?: string; staffProfileId?: string }) {
  return useQuery({
    queryKey: QK.consultation.records(filters),
    queryFn: async () => {
      const { data, error } = await consultationService.getAllRecords(filters);
      if (error) throw new Error(error.message);
      return (data ?? []) as ConsultationRecord[];
    },
  });
}

export function useConsultationRecord(id: string | null) {
  return useQuery({
    queryKey: QK.consultation.record(id ?? ""),
    queryFn: async () => {
      const { data, error } = await consultationService.getRecordById(id!);
      if (error) throw new Error(error.message);
      return data as ConsultationRecord;
    },
    enabled: !!id,
  });
}

export function useCreateConsultationTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof consultationService.createTemplate>[0]) => {
      const { data, error } = await consultationService.createTemplate(payload);
      if (error) throw new Error(error.message);
      return data as ConsultationFormTemplate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.consultation.templates() });
    },
  });
}

export function useUpdateConsultationTemplate() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Parameters<typeof consultationService.updateTemplate>[1]) => {
      const { data, error } = await consultationService.updateTemplate(
        id,
        payload as Parameters<typeof consultationService.updateTemplate>[1],
      );
      if (error) throw new Error(error.message);
      return data as ConsultationFormTemplate;
    },
    getQueueEntry: ({ id, ...payload }) => ({
      method: "PATCH",
      url: API_ROUTES.consultationTemplateById(id),
      payload,
      label: "Consultation Template",
      invalidateKeys: [QK.consultation.templates(), QK.consultation.template(id)],
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.consultation.templates() });
      qc.invalidateQueries({ queryKey: QK.consultation.template(id) });
    },
  });
}

export function useCreateConsultationRecord() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async (payload: Parameters<typeof consultationService.createRecord>[0]) => {
      const { data, error } = await consultationService.createRecord(payload);
      if (error) throw new Error(error.message);
      return data as ConsultationRecord;
    },
    getQueueEntry: (payload) => ({
      method: "POST",
      url: API_ROUTES.consultationRecords,
      payload,
      label: "Consultation Record",
      invalidateKeys: [QK.consultation.records()],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.consultation.records() });
    },
  });
}

export function useUpdateConsultationRecord() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & Parameters<typeof consultationService.updateRecord>[1]) => {
      const { data, error } = await consultationService.updateRecord(
        id,
        payload as Parameters<typeof consultationService.updateRecord>[1],
      );
      if (error) throw new Error(error.message);
      return data as ConsultationRecord;
    },
    getQueueEntry: ({ id, ...payload }) => ({
      method: "PATCH",
      url: API_ROUTES.consultationRecordById(id),
      payload,
      label: "Consultation Record",
      invalidateKeys: [QK.consultation.records(), QK.consultation.record(id)],
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.consultation.records() });
      qc.invalidateQueries({ queryKey: QK.consultation.record(id) });
    },
  });
}
