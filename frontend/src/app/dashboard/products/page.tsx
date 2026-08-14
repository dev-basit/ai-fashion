import { getCurrentUserDetails } from "@/lib/auth";
import { ProductsView } from "@/components/products/ProductsView";

export default async function ProductsPage() {
  const { user, profile } = await getCurrentUserDetails();

  return <ProductsView role={profile?.role ?? "customer"} userId={user.id} />;
}
