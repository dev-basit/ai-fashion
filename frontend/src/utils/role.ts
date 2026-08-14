import type { UserRole } from "@/types/database";

export function isAdmin(role: UserRole | undefined | null): boolean {
  return role === "admin";
}

export function isStaff(role: UserRole | undefined | null): boolean {
  return role === "staff";
}

export function isStaffOrAdmin(role: UserRole | undefined | null): boolean {
  return role === "admin" || role === "staff";
}

export function isCustomer(role: UserRole | undefined | null): boolean {
  return role === "customer";
}

export function canAccess(userRole: UserRole | undefined | null, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

export function getRoleLabel(role: UserRole): string {
  return { admin: "Admin", staff: "Staff", customer: "Customer" }[role];
}

export function getRoleBadgeColor(role: UserRole): string {
  return {
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    customer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }[role];
}
