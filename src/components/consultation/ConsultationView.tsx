"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ClipboardList, Pencil, FileText } from "lucide-react";
import Link from "next/link";
import { consultationService } from "@/services/consultation.service";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConsultationTemplateBuilder } from "./ConsultationTemplateBuilder";
import { ConsultationForm } from "./ConsultationForm";
import { formatDate } from "@/utils/date";
import type { ConsultationViewProps } from "@/types/props";
import type { ConsultationFormTemplate, ConsultationRecord } from "@/types/database";


export function ConsultationView({ role, userId, staffProfileId }: ConsultationViewProps) {
  const [templates, setTemplates] = useState<ConsultationFormTemplate[]>([]);
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editTemplate, setEditTemplate] = useState<ConsultationFormTemplate | null>(null);
  const [fillTemplateId, setFillTemplateId] = useState("");
  const [showFill, setShowFill] = useState(false);

  const isAdmin = role === "admin";
  const isCustomer = role === "customer";

  const load = useCallback(async () => {
    const [templatesResult, recordsResult] = await Promise.all([
      consultationService.getTemplates(),
      consultationService.getAllRecords(role === "staff" && staffProfileId ? { staffProfileId } : undefined),
    ]);
    setTemplates((templatesResult.data as unknown as ConsultationFormTemplate[]) ?? []);
    setRecords((recordsResult.data as unknown as ConsultationRecord[]) ?? []);
    setLoading(false);
  }, [role, staffProfileId]);

  useEffect(() => {
    load();
  }, [load]);

  const fillTemplate = templates.find((t) => t.id === fillTemplateId);

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation"
        description={isCustomer ? "Your consultations" : "Manage consultation forms and records"}
        action={
          isAdmin ? (
            <Button
              size="sm"
              onClick={() => {
                setEditTemplate(null);
                setShowBuilder(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> New Template
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setFillTemplateId("");
                setShowFill(true);
              }}
            >
              <FileText className="h-4 w-4 mr-1" /> {isCustomer ? "Start Questionnaire" : "Fill Consultation"}
            </Button>
          )
        }
      />

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">
            {isCustomer ? "My Records" : "Records"} ({records.length})
          </TabsTrigger>
          {isAdmin && <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="records" className="mt-4">
          {records.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-12 w-12" />}
              title="No consultation records"
              description="Consultation records will appear here."
            />
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <Link key={record.id} href={`/dashboard/consultation/${record.id}`}>
                  <Card className="hover:bg-accent transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          {!isCustomer && (
                            <p className="font-medium text-sm">
                              {(record as ConsultationRecord & { profiles?: { full_name?: string } }).profiles
                                ?.full_name ?? "Client"}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {(
                              record as ConsultationRecord & {
                                consultation_form_templates?: { name?: string };
                              }
                            ).consultation_form_templates?.name ?? "General Consultation"}
                          </p>
                          {record.observations && (
                            <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                              {record.observations}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(record.created_at)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="templates" className="mt-4">
            {templates.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-12 w-12" />}
                title="No templates"
                description="Create consultation form templates."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {templates.map((tmpl) => (
                  <Card key={tmpl.id}>
                    <CardContent className="p-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{tmpl.name}</h3>
                        {tmpl.description && (
                          <p className="text-xs text-muted-foreground mt-1">{tmpl.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">{tmpl.fields.length} fields</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditTemplate(tmpl);
                          setShowBuilder(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Template builder */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editTemplate ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <ConsultationTemplateBuilder
            template={editTemplate ?? undefined}
            onSuccess={() => {
              setShowBuilder(false);
              load();
            }}
            onCancel={() => setShowBuilder(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Fill consultation */}
      <Dialog open={showFill} onOpenChange={setShowFill}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCustomer ? "Consultation Questionnaire" : "Fill Consultation"}</DialogTitle>
          </DialogHeader>
          {!fillTemplate ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Select a form</Label>
                <Select
                  items={Object.fromEntries(templates.map((t) => [t.id, t.name]))}
                  onValueChange={(v: unknown) => setFillTemplateId(String(v ?? ""))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground">No consultation forms available yet.</p>
              )}
            </div>
          ) : (
            <ConsultationForm
              template={fillTemplate}
              clientId={isCustomer ? userId : undefined}
              staffProfileId={staffProfileId ?? null}
              onSuccess={() => {
                setShowFill(false);
                setFillTemplateId("");
                load();
              }}
              onCancel={() => {
                setShowFill(false);
                setFillTemplateId("");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
