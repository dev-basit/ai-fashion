"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { productsService } from "@/services/products.service";
import type { Product, ProductCategory } from "@/types/database";

export function useProducts(filters?: { categoryId?: string; search?: string }) {
  return useQuery({
    queryKey: QK.products(filters),
    queryFn: async () => {
      const { data, error } = await productsService.getAll(filters);
      if (error) throw new Error(error.message);
      return (data ?? []) as Product[];
    },
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: QK.product(id ?? ""),
    queryFn: async () => {
      const { data, error } = await productsService.getById(id!);
      if (error) throw new Error(error.message);
      return data as Product;
    },
    enabled: !!id,
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: QK.productCategories(),
    queryFn: async () => {
      const { data, error } = await productsService.getAllCategories();
      if (error) throw new Error(error.message);
      return (data ?? []) as ProductCategory[];
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const { data, error } = await productsService.create(
        payload as Parameters<typeof productsService.create>[0],
      );
      if (error) throw new Error(error.message);
      return data as Product;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.products() });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Product>) => {
      const { data, error } = await productsService.update(
        id,
        payload as Parameters<typeof productsService.update>[1],
      );
      if (error) throw new Error(error.message);
      return data as Product;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.products() });
      qc.invalidateQueries({ queryKey: QK.product(id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await productsService.delete(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.products() });
    },
  });
}

export function useUpdateProductStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await productsService.updateStock(id, quantity);
      if (error) throw new Error(error.message);
      return data as Product;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.products() });
      qc.invalidateQueries({ queryKey: QK.product(id) });
    },
  });
}

export function useCreateProductCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ProductCategory>) => {
      const { data, error } = await productsService.createCategory(
        payload as Parameters<typeof productsService.createCategory>[0],
      );
      if (error) throw new Error(error.message);
      return data as ProductCategory;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.productCategories() });
    },
  });
}
