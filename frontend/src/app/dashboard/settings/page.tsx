"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <SettingsView profile={profile} />;
}
