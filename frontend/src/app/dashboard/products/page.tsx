"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ProductsView } from "@/components/products/ProductsView";

export default function ProductsPage() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <ProductsView role={profile?.role ?? "customer"} userId={user!.id} />;
}
