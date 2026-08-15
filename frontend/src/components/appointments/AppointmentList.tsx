"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ChevronDown } from "lucide-react";
import { useUpdateAppointmentStatus } from "@/hooks/useAppointments";
import { formatDate, formatTime, formatDuration } from "@/utils/date";
import { formatCurrency } from "@/utils/format";
import { AppointmentStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APPOINTMENT_STATUS_TRANSITIONS } from "@/config/constants";
import type { AppointmentListProps } from "@/types/props";
import type { Appointment, AppointmentStatus } from "@/types/database";

export function AppointmentList({ appointments, isLoading, role, onRefresh }: AppointmentListProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const updateStatusMutation = useUpdateAppointmentStatus();

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setUpdating(id);
    updateStatusMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          setUpdating(null);
          onRefresh();
        },
      },
    );
  };

  if (isLoading) return <PageLoading />;

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-12 w-12" />}
        title="No appointments found"
        description="No appointments match your current filters."
      />
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => {
        const extApt = apt as Appointment & {
          profiles?: { full_name?: string; phone?: string };
          services?: { name?: string; duration_mins?: number };
          staff_profiles?: { profiles?: { full_name?: string } };
        };
        const transitions = APPOINTMENT_STATUS_TRANSITIONS[apt.status];
        return (
          <Card key={apt.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {extApt.services?.name && (
                      <span className="font-semibold text-sm">{extApt.services.name}</span>
                    )}
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span>
                      <span className="text-muted-foreground">Client: </span>
                      <span className="font-medium">{extApt.profiles?.full_name ?? "—"}</span>
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span>
                      <span className="text-muted-foreground">Staff: </span>
                      <span className="font-medium">{extApt.staff_profiles?.profiles?.full_name ?? "—"}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(apt.starts_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(apt.starts_at)}
                      {extApt.services?.duration_mins ? ` · ${formatDuration(extApt.services.duration_mins)}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <p className="font-semibold">{formatCurrency(apt.price)}</p>
                    <PaymentStatusBadge status={apt.payment_status} />
                  </div>
                  <Link
                    href={`/dashboard/appointments/${apt.id}`}
                    className="inline-flex items-center rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Details
                  </Link>
                  {role !== "customer" && transitions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none disabled:opacity-50"
                        disabled={updating === apt.id}
                      >
                        Actions <ChevronDown className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {transitions.map((status) => (
                          <DropdownMenuItem key={status} onClick={() => updateStatus(apt.id, status)}>
                            Mark as {status.replace("_", " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {role === "customer" && apt.status === "pending" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(apt.id, "cancelled")}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              {apt.notes && (
                <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">{apt.notes}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
