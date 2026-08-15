"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ReportsView } from "@/components/reports/ReportsView";

export default function ReportsPage() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <ReportsView role={profile?.role ?? "admin"} userId={user!.id} />;
}
