"use client";

import { create } from "zustand";
import type { AppointmentStatus } from "@/types/database";

interface AppointmentsStore {
  view: "calendar" | "list";
  selectedDate: Date;
  statusFilter: AppointmentStatus | "all";
  staffFilter: string | null;
  serviceFilter: string | null;
  setView: (view: "calendar" | "list") => void;
  setSelectedDate: (date: Date) => void;
  setStatusFilter: (status: AppointmentStatus | "all") => void;
  setStaffFilter: (id: string | null) => void;
  setServiceFilter: (id: string | null) => void;
  resetFilters: () => void;
}

export const useAppointmentsStore = create<AppointmentsStore>((set) => ({
  view: "list",
  selectedDate: new Date(),
  statusFilter: "all",
  staffFilter: null,
  serviceFilter: null,
  setView: (view) => set({ view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setStaffFilter: (id) => set({ staffFilter: id }),
  setServiceFilter: (id) => set({ serviceFilter: id }),
  resetFilters: () => set({ statusFilter: "all", staffFilter: null, serviceFilter: null }),
}));
