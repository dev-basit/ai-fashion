"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ServicesView } from "@/components/services/ServicesView";

export default function ServicesPage() {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <ServicesView role={profile?.role ?? "staff"} />;
}
