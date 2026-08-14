"use client";

import { useState } from "react";
import { ArrowLeft, Plus, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { useClientTreatmentPlan, useUpdateClientTreatmentPlan } from "@/hooks/useTreatmentPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { PLAN_STATUS_LABELS } from "@/config/constants";
import { formatDate, formatDateTime } from "@/utils/date";
import { PLAN_STATUSES } from "@/config/constants";
import type { TreatmentPlanProgressProps } from "@/types/props";
import type {
  ClientTreatmentPlan,
  TreatmentPlanTemplate,
  TreatmentProgressNote,
  PlanStatus,
} from "@/types/database";

export function TreatmentPlanProgress({ planId, role }: TreatmentPlanProgressProps) {
  const [note, setNote] = useState("");

  const isStaffOrAdmin = role === "staff" || role === "admin";

  const { data: planRaw, isLoading } = useClientTreatmentPlan(planId);
  const plan = planRaw as ClientTreatmentPlan | null | undefined;
  const updatePlan = useUpdateClientTreatmentPlan();

  if (isLoading || !plan) return <PageLoading />;

  const ext = plan as ClientTreatmentPlan & {
    profiles?: { full_name?: string };
    treatment_plan_templates?: TreatmentPlanTemplate;
  };
  const steps = ext.treatment_plan_templates?.steps ?? [];

  const addNote = () => {
    if (!note.trim()) return;
    const next: TreatmentProgressNote[] = [
      ...(plan.progress_notes ?? []),
      { date: new Date().toISOString(), note: note.trim() },
    ];
    updatePlan.mutate({ id: planId, progress_notes: next }, { onSuccess: () => setNote("") });
  };

  const changeStatus = (status: PlanStatus) => {
    updatePlan.mutate({ id: planId, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.treatmentPlans} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">{plan.name}</h1>
      </div>

      <Card>
        <CardContent className="p-6 text-sm space-y-1">
          {isStaffOrAdmin && ext.profiles?.full_name && (
            <p>
              <span className="text-muted-foreground">Client:</span>{" "}
              <span className="font-medium">{ext.profiles.full_name}</span>
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Started:</span> {formatDate(plan.starts_on)}
            {plan.ends_on ? ` · Ends ${formatDate(plan.ends_on)}` : ""}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-muted-foreground">Status:</span>
            {isStaffOrAdmin ? (
              <Select
                value={plan.status}
                items={PLAN_STATUS_LABELS}
                onValueChange={(v: unknown) => changeStatus(String(v) as PlanStatus)}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PLAN_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="font-medium capitalize">{PLAN_STATUS_LABELS[plan.status]}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Plan Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <Circle className="h-4 w-4 text-primary" />
                    {i < steps.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium">
                      Day {s.day}: {s.title}
                    </p>
                    {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isStaffOrAdmin && (
            <div className="space-y-2">
              <Label className="text-xs">Add progress note</Label>
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Client responding well to treatment..."
              />
              <Button size="sm" onClick={addNote} disabled={updatePlan.isPending || !note.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Add Note
              </Button>
            </div>
          )}
          <div className="space-y-2">
            {(plan.progress_notes ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No progress notes yet.</p>
            ) : (
              [...(plan.progress_notes ?? [])].reverse().map((n, i) => (
                <div key={i} className="flex gap-2 rounded-md border border-border p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">{n.note}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(n.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
