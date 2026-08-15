"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ProfileView } from "@/components/profile/ProfileView";

export default function ProfilePage() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <ProfileView profile={profile} email={user!.email ?? ""} />;
}
