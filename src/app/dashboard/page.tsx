import { getCurrentUserDetails } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserDetails();
  const role = profile?.role ?? "customer";

  if (role === "admin") return <AdminDashboard userId={user.id} />;
  if (role === "staff") return <StaffDashboard userId={user.id} />;
  return <CustomerDashboard userId={user.id} />;
}
