"use client";

import { useState } from "react";
import { consultationService } from "@/services/consultation.service";
import { clientsService } from "@/services/clients.service";
import { useEffect } from "react";
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
  const [clients, setClients] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientId) {
      const load = async () => {
        try {
          const { data } = await clientsService.getAll();
          setClients(data ?? []);
        } catch { /* ignore */ }
      };
      load();
    }
  }, [clientId]);

  const setResp = (fieldId: string, value: unknown) => setResponses((p) => ({ ...p, [fieldId]: value }));

  const save = async () => {
    if (!selectedClient) return;
    setSaving(true);
    await consultationService.createRecord({
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
    });
    setSaving(false);
    onSuccess();
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
          <Label>
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </Label>
          {field.type === "text" && (
            <Input
              value={(responses[field.id] as string) ?? ""}
              onChange={(e) => setResp(field.id, e.target.value)}
            />
          )}
          {field.type === "textarea" && (
            <Textarea
              rows={2}
              value={(responses[field.id] as string) ?? ""}
              onChange={(e) => setResp(field.id, e.target.value)}
            />
          )}
          {field.type === "date" && (
            <DatePicker value={(responses[field.id] as string) ?? ""} onChange={(v) => setResp(field.id, v)} />
          )}
          {(field.type === "select" || field.type === "radio") && (
            <Select onValueChange={(v: unknown) => setResp(field.id, String(v ?? ""))}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? []).map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.type === "checkbox" && (
            <div className="space-y-1.5">
              {(field.options ?? []).map((o) => {
                const arr = (responses[field.id] as string[]) ?? [];
                return (
                  <label key={o} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={arr.includes(o)}
                      onCheckedChange={(c) => setResp(field.id, c ? [...arr, o] : arr.filter((x) => x !== o))}
                    />
                    {o}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="space-y-1.5 border-t border-border pt-4">
        <Label>Observations</Label>
        <Textarea rows={2} value={observations} onChange={(e) => setObservations(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Recommendations (one per line)</Label>
        <Textarea rows={2} value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving || !selectedClient}>
          {saving ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
