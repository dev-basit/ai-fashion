"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { ROUTES, PRESET_RANGE_LABEL } from "@/config/constants";
import { computeDateRange } from "@/utils/date";
import { StatsCard } from "./StatsCard";
import { DateRangeFilter } from "./DateRangeFilter";
import type { DatePreset } from "@/types/database";
import { useAppointments } from "@/hooks/useAppointments";
import { formatDate, formatTime } from "@/utils/date";
import { AppointmentStatusBadge } from "@/components/common/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/common/LoadingSpinner";
import type { Appointment } from "@/types/database";
import type { DateRange } from "@/services/reports.service";

export function CustomerDashboard({ userId }: { userId: string }) {
  const [preset, setPreset] = useState<DatePreset>("7d");
  const [range, setRange] = useState<DateRange>(() => computeDateRange("7d"));

  const { data: aptsRaw, isLoading } = useAppointments(
    range.from && range.to ? { clientId: userId, dateFrom: range.from, dateTo: range.to } : undefined,
  );
  const { data: allAptsRaw } = useAppointments({ clientId: userId });

  const appointments = useMemo(
    () =>
      ((aptsRaw ?? []) as Appointment[]).sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    [aptsRaw],
  );

  const now = new Date().toISOString();
  const upcomingCount = useMemo(
    () =>
      ((allAptsRaw ?? []) as Appointment[]).filter((a) => a.starts_at >= now && a.status !== "cancelled").length,
    [allAptsRaw],
  );

  const handleRangeChange = (p: DatePreset, r: DateRange) => {
    setPreset(p);
    setRange(r);
  };

  const rangeLabel = PRESET_RANGE_LABEL[preset];

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        <DateRangeFilter preset={preset} onChange={handleRangeChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard
          title={`${rangeLabel} Appointments`}
          value={appointments.length}
          icon={Calendar}
          description="In selected period"
        />
        <StatsCard title="Upcoming" value={upcomingCount} icon={Clock} description="Future bookings" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Appointments — {rangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">No appointments in this period</p>
              <Link href={ROUTES.appointments} className={buttonVariants({ size: "sm" })}>
                Book Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {appointments.map((apt) => {
                const ext = apt as Appointment & {
                  services?: { name?: string };
                  staff_profiles?: { profiles?: { full_name?: string } };
                };
                return (
                  <div key={apt.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{ext.services?.name ?? "Appointment"}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span>
                          {formatDate(apt.starts_at)} at {formatTime(apt.starts_at)}
                        </span>
                        {ext.staff_profiles?.profiles?.full_name && (
                          <span>
                            Staff:{" "}
                            <span className="font-medium text-foreground">
                              {ext.staff_profiles.profiles.full_name}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <AppointmentStatusBadge status={apt.status} />
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
