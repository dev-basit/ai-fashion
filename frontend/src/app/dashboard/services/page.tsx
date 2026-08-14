import { getCurrentUserDetails } from "@/lib/auth";
import { ServicesView } from "@/components/services/ServicesView";

export default async function ServicesPage() {
  const { profile } = await getCurrentUserDetails();

  return <ServicesView role={profile?.role ?? "staff"} />;
}
