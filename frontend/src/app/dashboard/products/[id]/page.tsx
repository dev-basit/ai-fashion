"use client";

import { useParams, notFound } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProduct } from "@/hooks/useProducts";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ProductDetailView } from "@/components/products/ProductDetailView";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, isLoading } = useAuth();
  const { data: product, isLoading: productLoading } = useProduct(id);

  if (isLoading || productLoading) return <LoadingSpinner />;
  if (!product) return notFound();

  return (
    <ProductDetailView
      product={product as Parameters<typeof ProductDetailView>[0]["product"]}
      role={profile?.role ?? "customer"}
    />
  );
}
