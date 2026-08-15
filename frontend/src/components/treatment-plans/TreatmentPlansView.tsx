"use client";

import { useState } from "react";
import { Plus, FileText, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import { useClientTreatmentPlans, useTreatmentPlanTemplates } from "@/hooks/useTreatmentPlans";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TreatmentPlanTemplateBuilder } from "./TreatmentPlanTemplateBuilder";
import { TreatmentPlanAssign } from "./TreatmentPlanAssign";
import { formatDate } from "@/utils/date";
import { TREATMENT_PLAN_STATUS_CLASSES } from "@/config/colors";
import type { TreatmentPlansViewProps } from "@/types/props";
import type { ClientTreatmentPlan, TreatmentPlanTemplate } from "@/types/database";
import { PLAN_STATUS_LABELS } from "@/config/constants";

export function TreatmentPlansView({ role, userId }: TreatmentPlansViewProps) {
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editTemplate, setEditTemplate] = useState<TreatmentPlanTemplate | null>(null);
  const [showAssign, setShowAssign] = useState(false);

  const isStaffOrAdmin = role === "staff" || role === "admin";

  const planFilter = role === "customer" ? { clientId: userId } : undefined;
  const { data: plansRaw, isLoading: loadingPlans } = useClientTreatmentPlans(planFilter);
  const clientPlans = (plansRaw ?? []) as ClientTreatmentPlan[];

  const { data: templatesRaw, isLoading: loadingTemplates } = useTreatmentPlanTemplates();
  const templates = isStaffOrAdmin ? ((templatesRaw ?? []) as TreatmentPlanTemplate[]) : [];

  if (loadingPlans || (isStaffOrAdmin && loadingTemplates)) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treatment Plans"
        description={role === "customer" ? "Your treatment plans" : "Manage client treatment plans"}
        action={
          isStaffOrAdmin ? (
            <Button size="sm" onClick={() => setShowAssign(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Plan
            </Button>
          ) : undefined
        }
      />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Plans</TabsTrigger>
          {isStaffOrAdmin && <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {clientPlans.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No treatment plans"
              description={
                isStaffOrAdmin
                  ? "Assign a treatment plan to get started."
                  : "Your treatment plans will appear here."
              }
              action={
                isStaffOrAdmin ? (
                  <Button size="sm" onClick={() => setShowAssign(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Plan
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {clientPlans.map((plan) => {
                const ext = plan as ClientTreatmentPlan & { profiles?: { full_name?: string } };
                return (
                  <Link key={plan.id} href={`/dashboard/treatment-plans/${plan.id}`}>
                    <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{plan.name}</p>
                            {isStaffOrAdmin && ext.profiles?.full_name && (
                              <p className="text-xs text-muted-foreground">{ext.profiles.full_name}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Started {formatDate(plan.starts_on)}
                              {plan.ends_on ? ` · Ends ${formatDate(plan.ends_on)}` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {plan.progress_notes.length} progress notes
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TREATMENT_PLAN_STATUS_CLASSES[plan.status] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {PLAN_STATUS_LABELS[plan.status]}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        {isStaffOrAdmin && (
          <TabsContent value="templates" className="mt-4">
            <div className="flex justify-end mb-3">
              {role === "admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditTemplate(null);
                    setShowTemplateBuilder(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Template
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tmpl) => (
                <Card key={tmpl.id} className="flex flex-col">
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-sm">{tmpl.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {tmpl.duration_days}-day plan · {tmpl.steps.length} steps
                        </p>
                        {tmpl.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tmpl.description}</p>
                        )}
                      </div>
                      {role === "admin" && (
                        <button
                          onClick={() => {
                            setEditTemplate(tmpl);
                            setShowTemplateBuilder(true);
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {templates.length === 0 && (
                <p className="col-span-full text-center text-sm text-muted-foreground py-8">
                  No templates created yet.
                </p>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Assign Plan Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Treatment Plan</DialogTitle>
          </DialogHeader>
          <TreatmentPlanAssign
            assignedBy={userId}
            onSuccess={() => setShowAssign(false)}
            onCancel={() => setShowAssign(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Template Builder Dialog */}
      {role === "admin" && (
        <Dialog open={showTemplateBuilder} onOpenChange={setShowTemplateBuilder}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editTemplate ? "Edit Template" : "New Treatment Plan Template"}</DialogTitle>
            </DialogHeader>
            <TreatmentPlanTemplateBuilder
              template={editTemplate ?? undefined}
              onSuccess={() => setShowTemplateBuilder(false)}
              onCancel={() => setShowTemplateBuilder(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
