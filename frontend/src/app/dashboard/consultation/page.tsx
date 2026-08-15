"use client";

import { useAuth } from "@/hooks/useAuth";
import { useStaffByProfile } from "@/hooks/useStaff";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ConsultationView } from "@/components/consultation/ConsultationView";

export default function ConsultationPage() {
  const { user, profile, isLoading } = useAuth();
  const { data: staffData } = useStaffByProfile(profile?.role === "staff" ? (user?.id ?? null) : null);
  const staffProfileId = staffData?.[0]?.id;

  if (isLoading) return <LoadingSpinner />;

  return <ConsultationView role={profile?.role ?? "staff"} userId={user!.id} staffProfileId={staffProfileId} />;
}
