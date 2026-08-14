import { notFound } from "next/navigation";
import { getCurrentUserDetails } from "@/lib/auth";
import { TreatmentPlanProgress } from "@/components/treatment-plans/TreatmentPlanProgress";

export default async function TreatmentPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, supabase } = await getCurrentUserDetails();

  const { data: plan } = await supabase.from("client_treatment_plans").select("id").eq("id", id).single();
  if (!plan) notFound();

  return <TreatmentPlanProgress planId={id} role={profile?.role ?? "customer"} />;
}
