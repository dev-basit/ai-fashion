"use client";

import { useState, useEffect, useCallback } from "react";
import { servicesService } from "@/services/services.service";
import type { Service, ServiceCategory } from "@/types/database";

export function useServices(categoryId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    const [servicesResult, categoriesResult] = await Promise.all([
      servicesService.getAllServices(categoryId),
      servicesService.getAllCategories(),
    ]);
    if (servicesResult.data) setServices(servicesResult.data as unknown as Service[]);
    if (categoriesResult.data) setCategories(categoriesResult.data);
    setIsLoading(false);
  }, [categoryId]);

  useEffect(() => {
    setIsLoading(true);
    refetch();
  }, [refetch]);

  return { services, categories, isLoading, setServices, refetch };
}
