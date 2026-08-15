"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StaffView } from "@/components/staff/StaffView";

export default function StaffPage() {
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <StaffView />;
}
