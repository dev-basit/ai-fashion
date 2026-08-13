import { notFound } from "next/navigation";
import { getCurrentUserDetails } from "@/lib/auth";
import { ClientProfileView } from "@/components/clients/ClientProfileView";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile, supabase } = await getCurrentUserDetails();

  const { data: client } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!client) notFound();

  let staffProfileId: string | undefined;
  if (profile?.role === "staff" || profile?.role === "admin") {
    const { data: sp } = await supabase.from("staff_profiles").select("id").eq("profile_id", user.id).single();
    staffProfileId = sp?.id ?? undefined;
  }

  return <ClientProfileView client={client} role={profile?.role ?? "staff"} staffProfileId={staffProfileId} />;
}
