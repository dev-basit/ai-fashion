"use client";

import { useRole } from "@/hooks/useRole";
import type { RoleGuardProps } from "@/types/props";

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { can } = useRole();
  if (!can(roles)) return <>{fallback}</>;
  return <>{children}</>;
}
