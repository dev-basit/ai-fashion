"use client";

import { useQuery } from "@tanstack/react-query";
import { QK } from "@/config/query";
import { reportsService } from "@/services/reports.service";
import type { DateRange } from "@/services/reports.service";

export function useDashboardStats(range: DateRange) {
  return useQuery({
    queryKey: QK.dashboard(range as unknown as object),
    queryFn: async () => {
      const { data, error } = await reportsService.getDashboardStats(range);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!range.from && !!range.to,
  });
}

export function useRevenueReport(from: string, to: string) {
  return useQuery({
    queryKey: QK.reports("revenue", from, to),
    queryFn: async () => {
      const { data, error } = await reportsService.getRevenueStats({ from, to });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!from && !!to,
  });
}

export function useAppointmentReport(from: string, to: string) {
  return useQuery({
    queryKey: QK.reports("appointments", from, to),
    queryFn: async () => {
      const { data, error } = await reportsService.getAppointmentStats({ from, to });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!from && !!to,
  });
}

export function useClientReport(from: string, to: string) {
  return useQuery({
    queryKey: QK.reports("clients", from, to),
    queryFn: async () => {
      const { data, error } = await reportsService.getClientStats({ from, to });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!from && !!to,
  });
}

export function useStaffReport(from: string, to: string) {
  return useQuery({
    queryKey: QK.reports("staff", from, to),
    queryFn: async () => {
      const { data, error } = await reportsService.getStaffPerformance({ from, to });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!from && !!to,
  });
}

export function useOrderReport(from: string, to: string) {
  return useQuery({
    queryKey: QK.reports("orders", from, to),
    queryFn: async () => {
      const { data, error } = await reportsService.getOrderRevenue({ from, to });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!from && !!to,
  });
}

export function useProductSalesReport(from: string, to: string) {
  return useQuery({
    queryKey: QK.reports("products", from, to),
    queryFn: async () => {
      const { data, error } = await reportsService.getProductSales({ from, to });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!from && !!to,
  });
}
