import { getCurrentUserDetails } from "@/lib/auth";
import { ClientsView } from "@/components/clients/ClientsView";

export default async function ClientsPage() {
  const { profile } = await getCurrentUserDetails();

  return <ClientsView role={profile?.role ?? "staff"} />;
}
