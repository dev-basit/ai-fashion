"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { TreatmentPlanProgress } from "@/components/treatment-plans/TreatmentPlanProgress";

export default function TreatmentPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <TreatmentPlanProgress planId={id} role={profile?.role ?? "customer"} />;
}
