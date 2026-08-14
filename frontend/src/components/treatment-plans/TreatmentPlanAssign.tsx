"use client";

import type { TreatmentPlanAssignProps } from "@/types/props";

import { useState } from "react";
import { useTreatmentPlanTemplates, useCreateClientTreatmentPlan } from "@/hooks/useTreatmentPlans";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays, format } from "date-fns";
import type { TreatmentPlanTemplate, Profile } from "@/types/database";

export function TreatmentPlanAssign({ assignedBy, onSuccess, onCancel }: TreatmentPlanAssignProps) {
  const { data: templatesRaw } = useTreatmentPlanTemplates();
  const templates = (templatesRaw ?? []) as TreatmentPlanTemplate[];
  const { data: clientsRaw } = useClients();
  const clients = (clientsRaw ?? []) as Profile[];
  const [templateId, setTemplateId] = useState("");
  const [clientId, setClientId] = useState("");
  const [startsOn, setStartsOn] = useState(format(new Date(), "yyyy-MM-dd"));
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const createPlan = useCreateClientTreatmentPlan();
  const template = templates.find((t) => t.id === templateId);

  const save = async () => {
    if (!clientId) return;
    setSaving(true);
    const endsOn = template ? format(addDays(new Date(startsOn), template.duration_days), "yyyy-MM-dd") : null;
    try {
      await createPlan.mutateAsync({
        template_id: templateId || null,
        client_id: clientId,
        assigned_by: assignedBy,
        name: name || template?.name || "Treatment Plan",
        starts_on: startsOn,
        ends_on: endsOn,
        status: "active",
        progress_notes: [],
      });
    } finally {
      setSaving(false);
    }
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Client</Label>
        <Select
          items={Object.fromEntries(clients.map((c) => [c.id, c.full_name ?? "Client"]))}
          onValueChange={(v: unknown) => setClientId(String(v ?? ""))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Template</Label>
        <Select
          items={Object.fromEntries(templates.map((t) => [t.id, `${t.name} (${t.duration_days}d)`]))}
          onValueChange={(v: unknown) => {
            const id = String(v ?? "");
            setTemplateId(id);
            const t = templates.find((x) => x.id === id);
            if (t) setName(t.name);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} ({t.duration_days}d)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Plan Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Plan name" />
      </div>

      <div className="space-y-1.5">
        <Label>Start Date</Label>
        <DatePicker value={startsOn} onChange={setStartsOn} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving || !clientId}>
          {saving ? "Assigning..." : "Assign Plan"}
        </Button>
      </div>
    </div>
  );
}
