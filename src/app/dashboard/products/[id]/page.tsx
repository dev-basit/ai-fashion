import { notFound } from "next/navigation";
import { getCurrentUserDetails } from "@/lib/auth";
import { ProductDetailView } from "@/components/products/ProductDetailView";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, supabase } = await getCurrentUserDetails();

  const { data: product } = await supabase
    .from("products")
    .select("*, product_categories(*)")
    .eq("id", id)
    .single();
  if (!product) notFound();

  return (
    <ProductDetailView
      product={product as Parameters<typeof ProductDetailView>[0]["product"]}
      role={profile?.role ?? "customer"}
    />
  );
}
