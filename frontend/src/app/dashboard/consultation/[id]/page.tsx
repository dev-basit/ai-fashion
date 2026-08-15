"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ConsultationRecordView } from "@/components/consultation/ConsultationRecordView";

export default function ConsultationRecordPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <ConsultationRecordView recordId={id} role={profile?.role ?? "customer"} />;
}
