"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { API_ROUTES } from "@/config/constants";
import { appointmentsService, type AppointmentFilters } from "@/services/appointments.service";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import type { Appointment, AppointmentStatus } from "@/types/database";
import type { Database } from "@/types/supabase";

export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: QK.appointments(filters),
    queryFn: async () => {
      const { data, error } = await appointmentsService.getAll(filters);
      if (error) throw new Error(error.message);
      return (data ?? []) as Appointment[];
    },
  });
}

export function useAppointment(id: string | null) {
  return useQuery({
    queryKey: QK.appointment(id ?? ""),
    queryFn: async () => {
      const { data, error } = await appointmentsService.getById(id!);
      if (error) throw new Error(error.message);
      return data as Appointment;
    },
    enabled: !!id,
  });
}

export function useAppointmentProducts(appointmentId: string | null) {
  return useQuery({
    queryKey: [...QK.appointment(appointmentId ?? ""), "products"],
    queryFn: async () => {
      const { data, error } = await appointmentsService.getProductsUsed(appointmentId!);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!appointmentId,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async (payload: Partial<Appointment>) => {
      const { data, error } = await appointmentsService.create(payload);
      if (error) throw new Error(error.message);
      return data as Appointment;
    },
    getQueueEntry: (payload) => ({
      method: "POST",
      url: API_ROUTES.appointments,
      payload,
      label: "Appointment",
      invalidateKeys: [QK.appointments()],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.appointments() });
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async ({ id, ...payload }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await appointmentsService.update(id, payload);
      if (error) throw new Error(error.message);
      return data as Appointment;
    },
    getQueueEntry: ({ id, ...payload }) => ({
      method: "PATCH",
      url: API_ROUTES.appointmentById(id),
      payload,
      label: "Appointment",
      invalidateKeys: [QK.appointments(), QK.appointment(id)],
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.appointments() });
      qc.invalidateQueries({ queryKey: QK.appointment(id) });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { data, error } = await appointmentsService.updateStatus(id, status);
      if (error) throw new Error(error.message);
      return data as Appointment;
    },
    getQueueEntry: ({ id, status }) => ({
      method: "PATCH",
      url: API_ROUTES.appointmentById(id),
      payload: { status },
      label: "Appointment Status",
      invalidateKeys: [QK.appointments(), QK.appointment(id)],
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.appointments() });
      qc.invalidateQueries({ queryKey: QK.appointment(id) });
    },
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useOfflineMutation({
    mutationFn: async ({
      id,
      payment_status,
    }: {
      id: string;
      payment_status: Database["public"]["Tables"]["appointments"]["Row"]["payment_status"];
    }) => {
      const { data, error } = await appointmentsService.updatePaymentStatus(id, payment_status);
      if (error) throw new Error(error.message);
      return data as Appointment;
    },
    getQueueEntry: ({ id, payment_status }) => ({
      method: "PATCH",
      url: API_ROUTES.appointmentById(id),
      payload: { payment_status },
      label: "Payment Status",
      invalidateKeys: [QK.appointments(), QK.appointment(id)],
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.appointments() });
      qc.invalidateQueries({ queryKey: QK.appointment(id) });
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await appointmentsService.delete(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.appointments() });
    },
  });
}

export function useAddAppointmentProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      appointment_id: string;
      product_id: string;
      quantity: number;
      notes?: string;
    }) => {
      const { data, error } = await appointmentsService.addProductUsed(payload);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { appointment_id }) => {
      qc.invalidateQueries({ queryKey: [...QK.appointment(appointment_id), "products"] });
    },
  });
}

export function useRemoveAppointmentProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, appointmentId }: { id: string; appointmentId: string }) => {
      const { error } = await appointmentsService.removeProductUsed(id);
      if (error) throw new Error(error.message);
      return { appointmentId };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: [...QK.appointment(result.appointmentId), "products"] });
    },
  });
}
