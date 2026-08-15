"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ClientsView } from "@/components/clients/ClientsView";

export default function ClientsPage() {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <ClientsView role={profile?.role ?? "staff"} />;
}
