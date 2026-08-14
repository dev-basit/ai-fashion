"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { ordersService } from "@/services/orders.service";
import type { Order, OrderStatus } from "@/types/database";

export function useOrders(filters?: { clientId?: string }) {
  return useQuery({
    queryKey: QK.orders(filters),
    queryFn: async () => {
      const { data, error } = await ordersService.getAll(filters?.clientId);
      if (error) throw new Error(error.message);
      return (data ?? []) as Order[];
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data, error } = await ordersService.updateStatus(id, status);
      if (error) throw new Error(error.message);
      return data as Order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.orders() });
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof ordersService.create>[0]) => {
      const { data, error } = await ordersService.create(payload);
      if (error) throw new Error(error.message);
      return data as Order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.orders() });
      qc.invalidateQueries({ queryKey: QK.products() });
    },
  });
}
