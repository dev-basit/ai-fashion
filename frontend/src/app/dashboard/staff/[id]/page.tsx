"use client";

import { useParams, notFound } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useStaffMember } from "@/hooks/useStaff";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StaffProfileView } from "@/components/staff/StaffProfileView";

export default function StaffMemberPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isLoading } = useAuth();
  const { data: staffProfile, isLoading: staffLoading } = useStaffMember(id);

  if (isLoading || staffLoading) return <LoadingSpinner />;
  if (!staffProfile) return notFound();

  return (
    <StaffProfileView
      staffProfile={staffProfile}
      isOwnProfile={staffProfile.profile_id === user!.id}
      role={profile?.role ?? "staff"}
    />
  );
}
