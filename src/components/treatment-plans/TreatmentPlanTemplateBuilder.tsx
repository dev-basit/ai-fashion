"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCreateTreatmentPlanTemplate, useUpdateTreatmentPlanTemplate } from "@/hooks/useTreatmentPlans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TreatmentPlanTemplateBuilderProps } from "@/types/props";
import type { TreatmentPlanStep } from "@/types/database";


const DURATIONS = [30, 60, 90];

export function TreatmentPlanTemplateBuilder({ template, onSuccess, onCancel }: TreatmentPlanTemplateBuilderProps) {
  const isEdit = !!template;
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [duration, setDuration] = useState(String(template?.duration_days ?? 30));
  const [steps, setSteps] = useState<TreatmentPlanStep[]>(
    template?.steps ?? [{ day: 1, title: "", description: "" }],
  );
  const createTemplate = useCreateTreatmentPlanTemplate();
  const updateTemplate = useUpdateTreatmentPlanTemplate();
  const saving = createTemplate.isPending || updateTemplate.isPending;

  const updateStep = (i: number, patch: Partial<TreatmentPlanStep>) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const save = () => {
    const cleanSteps = steps.filter((s) => s.title.trim());
    const payload = {
      name,
      description: description || null,
      duration_days: parseInt(duration),
      steps: cleanSteps,
      is_active: true,
    };
    if (isEdit) {
      updateTemplate.mutate({ id: template!.id, ...payload }, { onSuccess });
    } else {
      createTemplate.mutate(payload, { onSuccess });
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acne Recovery Plan" />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Duration</Label>
        <Select
          value={duration}
          items={Object.fromEntries(DURATIONS.map((d) => [String(d), `${d}-day plan`]))}
          onValueChange={(v: unknown) => setDuration(String(v ?? "30"))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATIONS.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d}-day plan
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Steps</Label>
        {steps.map((s, i) => (
          <div key={i} className="rounded-md border border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-20">
                <Input
                  type="number"
                  min="1"
                  value={s.day}
                  onChange={(e) => updateStep(i, { day: parseInt(e.target.value) || 1 })}
                  placeholder="Day"
                  className="h-8"
                />
              </div>
              <Input
                value={s.title}
                onChange={(e) => updateStep(i, { title: e.target.value })}
                placeholder="Step title"
                className="flex-1 h-8"
              />
              <Button size="icon" variant="ghost" onClick={() => setSteps((p) => p.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Textarea
              rows={2}
              value={s.description}
              onChange={(e) => updateStep(i, { description: e.target.value })}
              placeholder="Instructions for this step"
            />
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setSteps((p) => [...p, { day: (p[p.length - 1]?.day ?? 0) + 1, title: "", description: "" }])
          }
        >
          <Plus className="h-4 w-4 mr-1" /> Add Step
        </Button>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving || !name.trim()}>
          {saving ? "Saving..." : isEdit ? "Save Template" : "Create Template"}
        </Button>
      </div>
    </div>
  );
}
