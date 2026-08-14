"use client";

import type { StaffServiceAssignmentProps } from "@/types/props";

import { useState, useEffect } from "react";
import { useStaffMember, useAssignService, useRemoveService } from "@/hooks/useStaff";
import { useServices } from "@/hooks/useServices";
import { Checkbox } from "@/components/ui/checkbox";
import type { Service } from "@/types/database";

export function StaffServiceAssignment({ staffProfileId, editable = true }: StaffServiceAssignmentProps) {
  const [assigned, setAssigned] = useState<Set<string>>(new Set());

  const { data: staffData } = useStaffMember(staffProfileId);
  const { data: servicesRaw } = useServices();
  const services = (servicesRaw ?? []) as Service[];
  const assignService = useAssignService();
  const removeService = useRemoveService();

  useEffect(() => {
    if (staffData) {
      const rows =
        (staffData as { staff_services?: { services?: { id: string } }[] } | null)?.staff_services ?? [];
      setAssigned(new Set(rows.map((r) => r.services?.id).filter(Boolean) as string[]));
    }
  }, [staffData]);

  const toggle = (serviceId: string, checked: boolean) => {
    if (!editable) return;
    setAssigned((prev) => {
      const next = new Set(prev);
      if (checked) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });
    if (checked) assignService.mutate({ staffProfileId, serviceId });
    else removeService.mutate({ staffProfileId, serviceId });
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
