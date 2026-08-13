"use client";

import { useState, useEffect, useCallback } from "react";
import { staffService } from "@/services/staff.service";
import type { StaffProfile } from "@/types/database";

export function useStaff() {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await staffService.getAll();
    if (error) setError(error.message);
    else setStaff((data as StaffProfile[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { staff, isLoading, error, refetch: fetch };
}
