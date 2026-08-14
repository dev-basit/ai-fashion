import { getCurrentUserDetails } from "@/lib/auth";
import { ConsultationView } from "@/components/consultation/ConsultationView";

export default async function ConsultationPage() {
  const { user, profile, supabase } = await getCurrentUserDetails();

  let staffProfileId: string | undefined;
  if (profile?.role === "staff") {
    const { data: sp } = await supabase.from("staff_profiles").select("id").eq("profile_id", user.id).single();
    staffProfileId = sp?.id;
  }

  return <ConsultationView role={profile?.role ?? "staff"} userId={user.id} staffProfileId={staffProfileId} />;
}
