"use client";

import { useState, useEffect, useCallback } from "react";
import { clientsService } from "@/services/clients.service";
import type { Profile } from "@/types/database";

export function useClients(search?: string) {
  const [clients, setClients] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await clientsService.getAll(search);
    if (error) setError(error.message);
    else setClients(data ?? []);
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { clients, isLoading, error, refetch: fetch };
}
