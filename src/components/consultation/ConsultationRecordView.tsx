"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { consultationService } from "@/services/consultation.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { formatDate } from "@/utils/date";
import type { ConsultationRecordViewProps } from "@/types/props";
import type { ConsultationRecord, ConsultationFormTemplate } from "@/types/database";

export function ConsultationRecordView({ recordId, role }: ConsultationRecordViewProps) {
  const [record, setRecord] = useState<ConsultationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [saving, setSaving] = useState(false);

  const isStaffOrAdmin = role === "staff" || role === "admin";

  const load = useCallback(async () => {
    const { data } = await consultationService.getRecordById(recordId);
    if (data) {
      const r = data as unknown as ConsultationRecord;
      setRecord(r);
      setObservations(r.observations ?? "");
      setRecommendations((r.recommendations ?? []).join("\n"));
    }
    setLoading(false);
  }, [recordId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    await consultationService.updateRecord(recordId, {
      observations: observations || null,
      recommendations: recommendations.trim()
        ? recommendations
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean)
        : null,
    });
    setSaving(false);
    load();
  };

  if (loading || !record) return <PageLoading />;

  const ext = record as ConsultationRecord & {
    profiles?: { full_name?: string };
    consultation_form_templates?: ConsultationFormTemplate;
  };
  const template = ext.consultation_form_templates;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.consultation} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Consultation Record</h1>
      </div>

      <Card>
        <CardContent className="p-6 text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Client:</span>{" "}
            <span className="font-medium">{ext.profiles?.full_name}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Template:</span> {template?.name ?? "General"}
          </p>
          <p>
            <span className="text-muted-foreground">Date:</span> {formatDate(record.created_at)}
          </p>
        </CardContent>
      </Card>

      {template && template.fields.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {template.fields.map((f) => {
              const val = (record.responses as Record<string, unknown>)?.[f.id];
              return (
                <div key={f.id}>
                  <p className="text-muted-foreground">{f.label}</p>
                  <p className="font-medium">{Array.isArray(val) ? val.join(", ") : (val as string) || "—"}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Observations & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isStaffOrAdmin ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Observations</Label>
                <Textarea rows={3} value={observations} onChange={(e) => setObservations(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Recommendations (one per line)</Label>
                <Textarea rows={3} value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />
              </div>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm">{record.observations || "No observations."}</p>
              {record.recommendations && record.recommendations.length > 0 && (
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {record.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
