import { cn } from "@/lib/utils";
import { APPOINTMENT_STATUS_BADGE_COLORS, PAYMENT_STATUS_BADGE_COLORS } from "@/config/colors";
import { APPOINTMENT_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/config/constants";
import { getRoleBadgeColor } from "@/utils/role";
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
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        getRoleBadgeColor(role as any),
      )}
    >
      {role}
    </span>
  );
}
