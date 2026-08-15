"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { TreatmentPlansView } from "@/components/treatment-plans/TreatmentPlansView";

export default function TreatmentPlansPage() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <TreatmentPlansView role={profile?.role ?? "customer"} userId={user!.id} />;
}
