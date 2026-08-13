import { notFound } from "next/navigation";
import { getCurrentUserDetails } from "@/lib/auth";
import { StaffProfileView } from "@/components/staff/StaffProfileView";

export default async function StaffMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile, supabase } = await getCurrentUserDetails();

  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();
  if (!staffProfile) notFound();

  return (
    <StaffProfileView
      staffProfile={staffProfile}
      isOwnProfile={staffProfile.profile_id === user.id}
      role={profile?.role ?? "staff"}
    />
  );
}
