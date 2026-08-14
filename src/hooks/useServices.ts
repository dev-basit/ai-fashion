"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { servicesService } from "@/services/services.service";
import type { Service, ServiceCategory, ServiceVariant } from "@/types/database";

export function useServices(categoryId?: string) {
  return useQuery({
    queryKey: QK.services(categoryId),
    queryFn: async () => {
      const { data, error } = await servicesService.getAllServices(categoryId);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Service[];
    },
  });
}

export function useService(id: string | null) {
  return useQuery({
    queryKey: QK.service(id ?? ""),
    queryFn: async () => {
      const { data, error } = await servicesService.getServiceById(id!);
      if (error) throw new Error(error.message);
      return data as unknown as Service;
    },
    enabled: !!id,
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: QK.serviceCategories(),
    queryFn: async () => {
      const { data, error } = await servicesService.getAllCategories();
      if (error) throw new Error(error.message);
      return (data ?? []) as ServiceCategory[];
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Service>) => {
      const { data, error } = await servicesService.createService(payload as Parameters<typeof servicesService.createService>[0]);
      if (error) throw new Error(error.message);
      return data as Service;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.services() });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Service>) => {
      const { data, error } = await servicesService.updateService(id, payload as Parameters<typeof servicesService.updateService>[1]);
      if (error) throw new Error(error.message);
      return data as Service;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.services() });
      qc.invalidateQueries({ queryKey: QK.service(id) });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await servicesService.deleteService(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.services() });
    },
  });
}

export function useCreateServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ServiceCategory>) => {
      const { data, error } = await servicesService.createCategory(payload as Parameters<typeof servicesService.createCategory>[0]);
      if (error) throw new Error(error.message);
      return data as ServiceCategory;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.serviceCategories() });
    },
  });
}

export function useUpdateServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<ServiceCategory>) => {
      const { data, error } = await servicesService.updateCategory(id, payload as Parameters<typeof servicesService.updateCategory>[1]);
      if (error) throw new Error(error.message);
      return data as ServiceCategory;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.serviceCategories() });
    },
  });
}

export function useDeleteServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await servicesService.deleteCategory(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.serviceCategories() });
    },
  });
}

export function useServiceVariants(serviceId: string | null) {
  return useQuery({
    queryKey: [...QK.service(serviceId ?? ""), "variants"],
    queryFn: async () => {
      const { data, error } = await servicesService.getVariants(serviceId!);
      if (error) throw new Error(error.message);
      return (data ?? []) as ServiceVariant[];
    },
    enabled: !!serviceId,
  });
}

export function useCreateServiceVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, ...payload }: { serviceId: string } & Partial<ServiceVariant>) => {
      const { data, error } = await servicesService.createVariant({ ...payload, service_id: serviceId });
      if (error) throw new Error(error.message);
      return data as ServiceVariant;
    },
    onSuccess: (_, { serviceId }) => {
      qc.invalidateQueries({ queryKey: QK.service(serviceId) });
      qc.invalidateQueries({ queryKey: QK.services() });
    },
  });
}

export function useUpdateServiceVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ variantId, serviceId, ...payload }: { variantId: string; serviceId: string } & Partial<ServiceVariant>) => {
      const { data, error } = await servicesService.updateVariant(variantId, payload as Parameters<typeof servicesService.updateVariant>[1]);
      if (error) throw new Error(error.message);
      return data as ServiceVariant;
    },
    onSuccess: (_, { serviceId }) => {
      qc.invalidateQueries({ queryKey: QK.service(serviceId) });
      qc.invalidateQueries({ queryKey: QK.services() });
    },
  });
}

export function useDeleteServiceVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ variantId, serviceId }: { variantId: string; serviceId: string }) => {
      const { error } = await servicesService.deleteVariant(variantId);
      if (error) throw new Error(error.message);
      return { serviceId };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: QK.service(result.serviceId) });
      qc.invalidateQueries({ queryKey: QK.services() });
    },
  });
}
