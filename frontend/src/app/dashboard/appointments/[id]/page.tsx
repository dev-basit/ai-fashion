"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AppointmentDetail } from "@/components/appointments/AppointmentDetail";

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <AppointmentDetail appointmentId={id} role={profile?.role ?? "customer"} />;
}
