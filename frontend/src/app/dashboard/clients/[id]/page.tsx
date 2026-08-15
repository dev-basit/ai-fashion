"use client";

import { useParams, notFound } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useClient } from "@/hooks/useClients";
import { useStaffByProfile } from "@/hooks/useStaff";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ClientProfileView } from "@/components/clients/ClientProfileView";

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isLoading } = useAuth();
  const { data: client, isLoading: clientLoading } = useClient(id);
  const { data: staffData } = useStaffByProfile(
    profile?.role === "staff" || profile?.role === "admin" ? (user?.id ?? null) : null,
  );
  const staffProfileId = staffData?.[0]?.id;

  if (isLoading || clientLoading) return <LoadingSpinner />;
  if (!client) return notFound();

  return <ClientProfileView client={client} role={profile?.role ?? "staff"} staffProfileId={staffProfileId} />;
}
