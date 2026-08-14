"use client";

import { useState } from "react";
import { Calendar, DollarSign, Users, Clock } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { StatsCard } from "./StatsCard";
import { DateRangeFilter, computeDateRange, PRESET_RANGE_LABEL } from "./DateRangeFilter";
import type { DatePreset } from "./DateRangeFilter";
import type { DateRange } from "@/services/reports.service";
import { useDashboardStats } from "@/hooks/useReports";
import { useAppointments } from "@/hooks/useAppointments";
import { formatCurrency } from "@/utils/format";
import { formatTime, formatDate } from "@/utils/date";
import { AppointmentStatusBadge } from "@/components/common/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/common/LoadingSpinner";
import type { Appointment } from "@/types/database";

export function AdminDashboard({ userId }: { userId: string }) {
  const [preset, setPreset] = useState<DatePreset>("today");
  const [range, setRange] = useState<DateRange>(() => computeDateRange("today"));

  const { data: statsRaw, isLoading: statsLoading } = useDashboardStats(range);
  const stats = statsRaw ?? {
    appointmentsCount: 0,
    pendingAppointmentsCount: 0,
    totalClientsCount: 0,
    appointmentRevenue: 0,
    orderRevenue: 0,
    revenue: 0,
  };

  const { data: aptsRaw, isLoading: aptsLoading } = useAppointments(
    range.from && range.to ? { dateFrom: range.from, dateTo: range.to } : undefined,
  );
  const appointments = ((aptsRaw ?? []) as Appointment[]).sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );

  const handleRangeChange = (p: DatePreset, r: DateRange) => {
    setPreset(p);
    setRange(r);
  };

  const rangeLabel = PRESET_RANGE_LABEL[preset];

  if (statsLoading || aptsLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <DateRangeFilter preset={preset} onChange={handleRangeChange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="sm:col-span-1">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">{rangeLabel} Revenue</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="font-bold text-base">{formatCurrency(stats.revenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Appointments</span>
                <span className="text-sm font-medium">{formatCurrency(stats.appointmentRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Products</span>
                <span className="text-sm font-medium">{formatCurrency(stats.orderRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sm:col-span-3 grid gap-4 sm:grid-cols-3">
          <StatsCard
            title={`${rangeLabel} Appointments`}
            value={stats.appointmentsCount}
            icon={Calendar}
            description="Scheduled in period"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingAppointmentsCount}
            icon={Clock}
            description="Awaiting confirmation"
          />
          <StatsCard
            title="Total Clients"
            value={stats.totalClientsCount}
            icon={Users}
            description="Active clients"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Appointments — {rangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No appointments in this period</p>
          ) : (
            <div className="divide-y divide-border">
              {appointments.map((apt) => {
                const ext = apt as Appointment & {
                  profiles?: { full_name?: string };
                  services?: { name?: string };
                  staff_profiles?: { profiles?: { full_name?: string } };
                };
                return (
                  <div key={apt.id} className="flex items-center justify-between py-3">
                    <div className="text-sm space-y-0.5">
                      <p className="font-medium">{ext.services?.name ?? "Service"}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span>
                          Client:{" "}
                          <span className="font-medium text-foreground">{ext.profiles?.full_name ?? "—"}</span>
                        </span>
                        <span>·</span>
                        <span>
                          Staff:{" "}
                          <span className="font-medium text-foreground">
                            {ext.staff_profiles?.profiles?.full_name ?? "—"}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right text-sm shrink-0">
                      <div>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href={ROUTES.clients}>
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">Manage Clients</p>
                <p className="text-xs text-muted-foreground">View all client profiles</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={ROUTES.services}>
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">Manage Services</p>
                <p className="text-xs text-muted-foreground">Update service catalog</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href={ROUTES.reports}>
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">View Reports</p>
                <p className="text-xs text-muted-foreground">Revenue & analytics</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
