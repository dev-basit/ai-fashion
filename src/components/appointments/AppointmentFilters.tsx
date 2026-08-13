"use client";

import { useState, useEffect } from "react";
import { useAppointmentsStore } from "@/store/appointments.store";
import { staffService } from "@/services/staff.service";
import { servicesService } from "@/services/services.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { APPOINTMENT_FILTER_OPTIONS } from "@/config/constants";
import type { AppointmentStatus, StaffProfile, Service } from "@/types/database";


export function AppointmentFilters({ showProvider = true }: { showProvider?: boolean }) {
  const {
    statusFilter,
    setStatusFilter,
    staffFilter,
    setStaffFilter,
    serviceFilter,
    setServiceFilter,
    resetFilters,
  } = useAppointmentsStore();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (showProvider)
      staffService.getAll().then(({ data }) => setStaff((data as unknown as StaffProfile[]) ?? []));
    servicesService.getAllServices().then(({ data }) => setServices((data as unknown as Service[]) ?? []));
  }, [showProvider]);

  const hasFilters = statusFilter !== "all" || !!staffFilter || !!serviceFilter;

  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <Select
        value={statusFilter}
        items={Object.fromEntries(APPOINTMENT_FILTER_OPTIONS.map((o) => [o.value, o.label]))}
        onValueChange={(v: unknown) => setStatusFilter(String(v) as AppointmentStatus | "all")}
      >
        <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {APPOINTMENT_FILTER_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showProvider && (
        <Select
          value={staffFilter ?? "all"}
          items={{
            all: "All Staff",
            ...Object.fromEntries(
              staff.map((s) => [
                s.id,
                (s as StaffProfile & { profiles?: { full_name?: string } }).profiles?.full_name ?? "Staff",
              ]),
            ),
          }}
          onValueChange={(v: unknown) => setStaffFilter(String(v) === "all" ? null : String(v))}
        >
          <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
            <SelectValue placeholder="Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {staff.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {(s as StaffProfile & { profiles?: { full_name?: string } }).profiles?.full_name ?? "Staff"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={serviceFilter ?? "all"}
        items={{
          all: "All Services",
          ...Object.fromEntries(services.map((s) => [s.id, s.name])),
        }}
        onValueChange={(v: unknown) => setServiceFilter(String(v) === "all" ? null : String(v))}
      >
        <SelectTrigger className="w-full sm:w-36 h-8 text-xs">
          <SelectValue placeholder="Service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Services</SelectItem>
          {services.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
