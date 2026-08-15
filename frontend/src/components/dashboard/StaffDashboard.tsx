"use client";

import { useState } from "react";
import { Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { PRESET_RANGE_LABEL } from "@/config/constants";
import { computeDateRange } from "@/utils/date";
import { StatsCard } from "./StatsCard";
import { DateRangeFilter } from "./DateRangeFilter";
import type { DatePreset } from "@/types/database";
import { useStaffByProfile } from "@/hooks/useStaff";
import { useAppointments } from "@/hooks/useAppointments";
import { formatTime, formatDate } from "@/utils/date";
import { AppointmentStatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/common/LoadingSpinner";
import type { Appointment, StaffProfile } from "@/types/database";
import type { DateRange } from "@/services/reports.service";

export function StaffDashboard({ userId }: { userId: string }) {
  const [preset, setPreset] = useState<DatePreset>("today");
  const [range, setRange] = useState<DateRange>(() => computeDateRange("today"));

  const { data: staffData, isLoading: staffLoading } = useStaffByProfile(userId);
  const staffProfile = (staffData?.[0] ?? null) as StaffProfile | null;

  const { data: aptsRaw, isLoading: aptsLoading } = useAppointments(
    staffProfile && range.from && range.to
      ? { staffProfileId: staffProfile.id, dateFrom: range.from, dateTo: range.to }
      : undefined,
  );
  const appointments = ((aptsRaw ?? []) as Appointment[]).sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );

  const handleRangeChange = (p: DatePreset, r: DateRange) => {
    setPreset(p);
    setRange(r);
  };

  if (staffLoading) return <PageLoading />;

  const completed = appointments.filter((a) => a.status === "completed").length;
  const pending = appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length;
  const rangeLabel = PRESET_RANGE_LABEL[preset];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        <DateRangeFilter preset={preset} onChange={handleRangeChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title={`${rangeLabel} Appointments`} value={appointments.length} icon={Calendar} />
        <StatsCard title="Pending / Confirmed" value={pending} icon={Clock} />
        <StatsCard title="Completed" value={completed} icon={CheckCircle} />
        <StatsCard
          title="Availability"
          value={staffProfile?.is_available ? "Available" : "Unavailable"}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">My Appointments — {rangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          {aptsLoading ? (
            <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
          ) : appointments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No appointments in this period</p>
          ) : (
            <div className="divide-y divide-border">
              {appointments.map((apt) => {
                const extApt = apt as Appointment & {
                  profiles?: { full_name?: string };
                  services?: { name?: string };
                  staff_profiles?: { profiles?: { full_name?: string } };
                };
                return (
                  <div key={apt.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      {extApt.services?.name && <p className="text-sm font-medium">{extApt.services.name}</p>}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span>
                          Client:{" "}
                          <span className="font-medium text-foreground">{extApt.profiles?.full_name ?? "—"}</span>
                        </span>
                        <span>·</span>
                        <span>
                          Staff:{" "}
                          <span className="font-medium text-foreground">
                            {extApt.staff_profiles?.profiles?.full_name ?? "—"}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right text-sm">
                        <p className="font-medium">{formatDate(apt.starts_at)}</p>
                        <p className="text-muted-foreground">{formatTime(apt.starts_at)}</p>
                      </div>
                      <AppointmentStatusBadge status={apt.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
