import { notFound } from "next/navigation";
import { getCurrentUserDetails } from "@/lib/auth";
import { ConsultationRecordView } from "@/components/consultation/ConsultationRecordView";

export default async function ConsultationRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, supabase } = await getCurrentUserDetails();

  const { data: record } = await supabase.from("consultation_records").select("id").eq("id", id).single();
  if (!record) notFound();

  return <ConsultationRecordView recordId={id} role={profile?.role ?? "customer"} />;
}
