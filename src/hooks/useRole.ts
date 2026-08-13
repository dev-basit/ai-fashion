"use client";

import { useAuthStore } from "@/store/auth.store";
import { isAdmin, isStaff, isStaffOrAdmin, isCustomer, canAccess } from "@/utils/role";
import type { UserRole } from "@/types/database";

export function useRole() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role;

  return {
    role,
    isAdmin: isAdmin(role),
    isStaff: isStaff(role),
    isStaffOrAdmin: isStaffOrAdmin(role),
    isCustomer: isCustomer(role),
    can: (roles: UserRole[]) => canAccess(role, roles),
  };
}
