import { getCurrentUserDetails } from "@/lib/auth";
import { ReportsView } from "@/components/reports/ReportsView";

export default async function ReportsPage() {
  const { user, profile } = await getCurrentUserDetails();

  return <ReportsView role={profile?.role ?? "admin"} userId={user.id} />;
}
