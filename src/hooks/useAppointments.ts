"use client";

import { useState, useEffect, useCallback } from "react";
import { appointmentsService, type AppointmentFilters } from "@/services/appointments.service";
import type { Appointment } from "@/types/database";

export function useAppointments(filters?: AppointmentFilters) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await appointmentsService.getAll(filters);
    if (error) setError(error.message);
    else setAppointments((data as Appointment[]) ?? []);
    setIsLoading(false);
  }, [filters?.clientId, filters?.staffProfileId, filters?.status, filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { appointments, isLoading, error, refetch: fetch, setAppointments };
}
