"use client";

import { useState, useEffect, useCallback } from "react";
import { productsService } from "@/services/products.service";
import type { Product, ProductCategory } from "@/types/database";

export function useProducts(filters?: { categoryId?: string; search?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const [productsResult, categoriesResult] = await Promise.all([
      productsService.getAll(filters),
      productsService.getAllCategories(),
    ]);
    if (productsResult.data) setProducts(productsResult.data as Product[]);
    if (categoriesResult.data) setCategories(categoriesResult.data);
    setIsLoading(false);
  }, [filters?.categoryId, filters?.search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, categories, isLoading, refetch: fetch, setProducts };
}
