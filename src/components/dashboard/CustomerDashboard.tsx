"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { StatsCard } from "./StatsCard";
import { DateRangeFilter, computeDateRange, PRESET_RANGE_LABEL } from "./DateRangeFilter";
import type { DatePreset } from "./DateRangeFilter";
import { appointmentsService } from "@/services/appointments.service";
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (r: DateRange) => {
      if (!r.from || !r.to) return;
      const { data } = await appointmentsService.getAll({ clientId: userId, dateFrom: r.from, dateTo: r.to });
      const all = ((data as Appointment[]) ?? []).sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
      setAppointments(all);

      // upcoming count is always absolute (future, not date-filtered)
      const { data: allData } = await appointmentsService.getAll({ clientId: userId });
      const now = new Date().toISOString();
      setUpcomingCount(
        ((allData as Appointment[]) ?? []).filter((a) => a.starts_at >= now && a.status !== "cancelled").length,
      );

      setLoading(false);
    },
    [userId],
  );

  useEffect(() => {
    load(range);
  }, [load, range]);

  const handleRangeChange = (p: DatePreset, r: DateRange) => {
    setPreset(p);
    setRange(r);
    setLoading(true);
    load(r);
  };

  const rangeLabel = PRESET_RANGE_LABEL[preset];

  if (loading) return <PageLoading />;

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
