"use client";

import { useState } from "react";
import { useCreateConsultationRecord } from "@/hooks/useConsultation";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { ConsultationFormProps } from "@/types/props";
import type { ConsultationField, Profile } from "@/types/database";

export function ConsultationForm({
  template,
  clientId,
  staffProfileId,
  onSuccess,
  onCancel,
}: ConsultationFormProps) {
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [observations, setObservations] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [selectedClient, setSelectedClient] = useState(clientId ?? "");

  const { data: clientsRaw } = useClients();
  const clients = (!clientId ? (clientsRaw ?? []) : []) as Profile[];
  const createRecord = useCreateConsultationRecord();

  const setResp = (fieldId: string, value: unknown) => setResponses((p) => ({ ...p, [fieldId]: value }));

  const save = () => {
    if (!selectedClient) return;
    createRecord.mutate(
      {
        template_id: template.id,
        client_id: selectedClient,
        staff_profile_id: staffProfileId ?? null,
        responses,
        observations: observations || null,
        recommendations: recommendations.trim()
          ? recommendations
              .split("\n")
              .map((r) => r.trim())
              .filter(Boolean)
          : null,
        submitted_at: new Date().toISOString(),
      },
      { onSuccess },
    );
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {!clientId && (
        <div className="space-y-1.5">
          <Label>Client</Label>
          <Select
            items={Object.fromEntries(clients.map((c) => [c.id, c.full_name ?? "Client"]))}
            onValueChange={(v: unknown) => setSelectedClient(String(v ?? ""))}
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
      )}

      {template.fields.map((field: ConsultationField) => (
        <div key={field.id} className="space-y-1.5">
          <Label className="text-sm">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.type === "text" && (
            <Input
              placeholder={field.placeholder}
              value={String(responses[field.id] ?? "")}
              onChange={(e) => setResp(field.id, e.target.value)}
            />
          )}
          {field.type === "textarea" && (
            <Textarea
              rows={3}
              placeholder={field.placeholder}
              value={String(responses[field.id] ?? "")}
              onChange={(e) => setResp(field.id, e.target.value)}
            />
          )}
          {field.type === "select" && field.options && (
            <Select
              value={String(responses[field.id] ?? "")}
              items={Object.fromEntries(field.options.map((o: string) => [o, o]))}
              onValueChange={(v: unknown) => setResp(field.id, String(v ?? ""))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((o: string) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.type === "checkbox" && (
            <div className="flex items-center gap-2">
              <Checkbox checked={Boolean(responses[field.id])} onCheckedChange={(c) => setResp(field.id, !!c)} />
              <span className="text-sm text-muted-foreground">{field.placeholder ?? "Yes"}</span>
            </div>
          )}
          {field.type === "date" && (
            <DatePicker value={String(responses[field.id] ?? "")} onChange={(v) => setResp(field.id, v)} />
          )}
          {(field.type as string) === "number" && (
            <Input
              type="number"
              placeholder={field.placeholder}
              value={String(responses[field.id] ?? "")}
              onChange={(e) => setResp(field.id, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className="space-y-1.5">
        <Label className="text-sm">Observations (staff only)</Label>
        <Textarea
          rows={2}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Clinical observations..."
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Recommendations (one per line)</Label>
        <Textarea
          rows={3}
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="- Use SPF 50 daily&#10;- Avoid fragrance products"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel} disabled={createRecord.isPending}>
          Cancel
        </Button>
        <Button onClick={save} disabled={createRecord.isPending || !selectedClient}>
          {createRecord.isPending ? "Saving..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
