"use client";

import { useAuth } from "@/hooks/useAuth";
import { useStaffByProfile } from "@/hooks/useStaff";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AppointmentsView } from "@/components/appointments/AppointmentsView";

export default function AppointmentsPage() {
  const { user, profile, isLoading } = useAuth();
  const { data: staffData } = useStaffByProfile(profile?.role === "staff" ? (user?.id ?? null) : null);
  const staffProfileId = staffData?.[0]?.id;

  if (isLoading) return <LoadingSpinner />;

  return <AppointmentsView role={profile?.role ?? "customer"} userId={user!.id} staffProfileId={staffProfileId} />;
}
