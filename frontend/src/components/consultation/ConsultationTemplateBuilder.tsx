"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useCreateConsultationTemplate, useUpdateConsultationTemplate } from "@/hooks/useConsultation";
import { CONSULTATION_FIELD_TYPES } from "@/config/constants";
import { newConsultationField } from "@/utils/consultation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConsultationTemplateBuilderProps } from "@/types/props";
import type { ConsultationField } from "@/types/database";

export function ConsultationTemplateBuilder({ template, onSuccess, onCancel }: ConsultationTemplateBuilderProps) {
  const isEdit = !!template;
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [fields, setFields] = useState<ConsultationField[]>(template?.fields ?? [newConsultationField()]);
  const createTemplate = useCreateConsultationTemplate();
  const updateTemplate = useUpdateConsultationTemplate();
  const saving = createTemplate.isPending || updateTemplate.isPending;

  const updateField = (id: string, patch: Partial<ConsultationField>) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const save = () => {
    const cleanFields = fields
      .filter((f) => f.label.trim())
      .map((f) => ({
        ...f,
        options: ["select", "radio", "checkbox"].includes(f.type) ? f.options : undefined,
      }));
    const payload = { name, description: description || null, fields: cleanFields, is_active: true };
    if (isEdit) {
      updateTemplate.mutate({ id: template!.id, ...payload }, { onSuccess });
    } else {
      createTemplate.mutate(payload, { onSuccess });
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Template Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Skin Consultation" />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="space-y-3">
        <Label>Fields</Label>
        {fields.map((f) => (
          <div key={f.id} className="rounded-md border border-border p-3 space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Input
                className="flex-1"
                value={f.label}
                onChange={(e) => updateField(f.id, { label: e.target.value })}
                placeholder="Question / field label"
              />
              <Button size="icon" variant="ghost" onClick={() => setFields((p) => p.filter((x) => x.id !== f.id))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={f.type}
                onValueChange={(v: unknown) => updateField(f.id, { type: String(v) as ConsultationField["type"] })}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSULTATION_FIELD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={f.required} onCheckedChange={(c) => updateField(f.id, { required: c })} />
                Required
              </label>
            </div>
            {["select", "radio", "checkbox"].includes(f.type) && (
              <Input
                value={(f.options ?? []).join(", ")}
                onChange={(e) =>
                  updateField(f.id, {
                    options: e.target.value
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Options, comma-separated"
                className="text-xs"
              />
            )}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setFields((p) => [...p, newConsultationField()])}>
          <Plus className="h-4 w-4 mr-1" /> Add Field
        </Button>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving || !name.trim() || fields.every((f) => !f.label.trim())}>
          {saving ? "Saving..." : isEdit ? "Save Template" : "Create Template"}
        </Button>
      </div>
    </div>
  );
}
