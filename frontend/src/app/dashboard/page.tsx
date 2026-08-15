"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";

export default function DashboardPage() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  const role = profile?.role ?? "customer";

  if (role === "admin") return <AdminDashboard userId={user!.id} />;
  if (role === "staff") return <StaffDashboard userId={user!.id} />;
  return <CustomerDashboard userId={user!.id} />;
}
