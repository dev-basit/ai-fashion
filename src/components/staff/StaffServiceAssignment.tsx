"use client";

import type { StaffServiceAssignmentProps } from "@/types/props";

import { useState, useEffect } from "react";
import { staffService } from "@/services/staff.service";
import { servicesService } from "@/services/services.service";
import { Checkbox } from "@/components/ui/checkbox";
import type { Service } from "@/types/database";

export function StaffServiceAssignment({ staffProfileId, editable = true }: StaffServiceAssignmentProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [assigned, setAssigned] = useState<Set<string>>(new Set());

  useEffect(() => {
    servicesService.getAllServices().then(({ data }) => setServices((data as unknown as Service[]) ?? []));
    staffService.getById(staffProfileId).then(({ data }) => {
      const rows = (data as { staff_services?: { services?: { id: string } }[] } | null)?.staff_services ?? [];
      setAssigned(new Set(rows.map((r) => r.services?.id).filter(Boolean) as string[]));
    });
  }, [staffProfileId]);

  const toggle = async (serviceId: string, checked: boolean) => {
    if (!editable) return;
    setAssigned((prev) => {
      const next = new Set(prev);
      if (checked) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });
    if (checked) await staffService.assignService(staffProfileId, serviceId);
    else await staffService.removeService(staffProfileId, serviceId);
  };

  if (services.length === 0) return <p className="text-sm text-muted-foreground">No services available.</p>;

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      {services.map((s) => (
        <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={assigned.has(s.id)} onCheckedChange={(c) => toggle(s.id, !!c)} disabled={!editable} />
          <span>{s.name}</span>
        </label>
      ))}
    </div>
  );
}
