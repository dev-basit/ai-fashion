import { notFound } from "next/navigation";
import { getCurrentUserDetails } from "@/lib/auth";
import { AppointmentDetail } from "@/components/appointments/AppointmentDetail";

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, supabase } = await getCurrentUserDetails();

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "*, services(id, name, duration_mins, base_price), profiles!client_id(id, full_name, avatar_url, phone), staff_profiles(id, profiles(id, full_name))",
    )
    .eq("id", id)
    .single();
  if (!appointment) notFound();

  return <AppointmentDetail appointmentId={id} role={profile?.role ?? "customer"} />;
}
