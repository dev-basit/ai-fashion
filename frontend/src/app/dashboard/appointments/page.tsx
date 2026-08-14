import { getCurrentUserDetails } from "@/lib/auth";
import { AppointmentsView } from "@/components/appointments/AppointmentsView";

export default async function AppointmentsPage() {
  const { user, profile, supabase } = await getCurrentUserDetails();

  let staffProfileId: string | undefined;
  if (profile?.role === "staff") {
    const { data: sp } = await supabase.from("staff_profiles").select("id").eq("profile_id", user.id).single();
    staffProfileId = sp?.id;
  }

  return <AppointmentsView role={profile?.role ?? "customer"} userId={user.id} staffProfileId={staffProfileId} />;
}
