import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { APPOINTMENT_STATUS_BADGE_COLORS, PAYMENT_STATUS_BADGE_COLORS } from "@/config/colors";
import { APPOINTMENT_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/config/constants";
import type { AppointmentStatus, PaymentStatus } from "@/types/database";


export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        APPOINTMENT_STATUS_BADGE_COLORS[status],
      )}
    >
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PAYMENT_STATUS_BADGE_COLORS[status],
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    staff: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    customer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colors[role] ?? "bg-gray-100 text-gray-800",
      )}
    >
      {role}
    </span>
  );
}
