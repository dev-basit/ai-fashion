"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/constants";
import { ArrowLeft, Calendar, ShoppingBag, ClipboardList, FileText, Pencil, UserX, Plus } from "lucide-react";
import Link from "next/link";
import { useClientHistory, useDeactivateClient } from "@/hooks/useClients";
import { useCreateConsultationRecord } from "@/hooks/useConsultation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ClientForm } from "./ClientForm";
import { AppointmentStatusBadge } from "@/components/common/StatusBadge";
import { formatInitials, formatCurrency } from "@/utils/format";
import { formatDate, formatTime } from "@/utils/date";
import { PageLoading } from "@/components/common/LoadingSpinner";
import type { ClientProfileViewProps } from "@/types/props";
import type {
  Appointment,
  Order,
  ConsultationRecord,
  ClientTreatmentPlan,
} from "@/types/database";


export function ClientProfileView({ client, role, staffProfileId }: ClientProfileViewProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [noteObs, setNoteObs] = useState("");
  const [noteRecs, setNoteRecs] = useState("");

  const isStaffOrAdmin = role === "staff" || role === "admin";

  const { data: historyRaw, isLoading } = useClientHistory(client.id);
  const history = historyRaw as {
    appointments?: Appointment[];
    orders?: Order[];
    consultations?: ConsultationRecord[];
    plans?: ClientTreatmentPlan[];
  } | null;

  const deactivateClient = useDeactivateClient();
  const createNote = useCreateConsultationRecord();

  const handleDeactivate = () => {
    deactivateClient.mutate(client.id, {
      onSuccess: () => {
        setShowDeactivate(false);
        router.push(ROUTES.clients);
        router.refresh();
      },
    });
  };

  const handleAddNote = () => {
    if (!noteObs.trim()) return;
    createNote.mutate(
      {
        client_id: client.id,
        staff_profile_id: staffProfileId ?? null,
        observations: noteObs.trim(),
        recommendations: noteRecs.trim()
          ? noteRecs
              .split("\n")
              .map((r) => r.trim())
              .filter(Boolean)
          : null,
        submitted_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setShowNote(false);
          setNoteObs("");
          setNoteRecs("");
        },
      },
    );
  };

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.clients} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Client Profile</h1>
        </div>
        <div className="flex gap-2">
          {isStaffOrAdmin && (
            <Button size="sm" variant="outline" onClick={() => setShowNote(true)}>
              <Plus className="h-4 w-4 mr-1" /> Note
            </Button>
          )}
          {role === "admin" && (
            <>
              <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setShowDeactivate(true)}>
                <UserX className="h-4 w-4 mr-1" /> Deactivate
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {formatInitials(client.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{client.full_name ?? "Unnamed"}</h2>
              <p className="text-muted-foreground">{client.phone ?? "No phone number"}</p>
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(client.created_at, "MMMM yyyy")}
              </p>
              {client.notes && <p className="text-sm text-muted-foreground mt-2 max-w-prose">{client.notes}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">
            <Calendar className="h-4 w-4 mr-1" />
            Appointments ({history?.appointments?.length ?? 0})
          </TabsTrigger>
          {role !== "staff" && (
            <TabsTrigger value="orders">
              <ShoppingBag className="h-4 w-4 mr-1" />
              Orders ({history?.orders?.length ?? 0})
            </TabsTrigger>
          )}
          <TabsTrigger value="consultations">
            <ClipboardList className="h-4 w-4 mr-1" />
            Consultations ({history?.consultations?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="plans">
            <FileText className="h-4 w-4 mr-1" />
            Plans ({history?.plans?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-4">
          <div className="space-y-3">
            {(history?.appointments ?? []).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {(apt as Appointment & { services?: { name?: string } }).services?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(apt.starts_at)} at {formatTime(apt.starts_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {role !== "staff" && <span className="text-sm font-medium">{formatCurrency(apt.price)}</span>}
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!history?.appointments?.length && (
              <p className="text-center text-sm text-muted-foreground py-8">No appointments yet</p>
            )}
          </div>
        </TabsContent>

        {role !== "staff" && (
          <TabsContent value="orders" className="mt-4">
            <div className="space-y-3">
              {(history?.orders ?? []).map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Order #{order.id.slice(-8)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <span className="font-medium text-sm">{formatCurrency(order.total_amount)}</span>
                  </CardContent>
                </Card>
              ))}
              {!history?.orders?.length && (
                <p className="text-center text-sm text-muted-foreground py-8">No orders yet</p>
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="consultations" className="mt-4">
          <div className="space-y-3">
            {(history?.consultations ?? []).map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <p className="font-medium text-sm">
                    {(c as ConsultationRecord & { consultation_form_templates?: { name?: string } })
                      .consultation_form_templates?.name ?? "Consultation Note"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                  {c.observations && <p className="text-sm mt-2 text-muted-foreground">{c.observations}</p>}
                  {c.recommendations && c.recommendations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.recommendations.map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {!history?.consultations?.length && (
              <p className="text-center text-sm text-muted-foreground py-8">No consultations yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <div className="space-y-3">
            {(history?.plans ?? []).map((plan) => (
              <Card key={plan.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">Started {formatDate(plan.starts_on)}</p>
                  </div>
                  <span className="capitalize text-sm text-muted-foreground">{plan.status}</span>
                </CardContent>
              </Card>
            ))}
            {!history?.plans?.length && (
              <p className="text-center text-sm text-muted-foreground py-8">No treatment plans yet</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={client}
            onSuccess={() => {
              setShowEdit(false);
              router.refresh();
            }}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showNote} onOpenChange={setShowNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Consultation Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Observations</Label>
              <Textarea
                rows={4}
                value={noteObs}
                onChange={(e) => setNoteObs(e.target.value)}
                placeholder="Skin condition, concerns, treatment performed..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Recommendations (one per line)</Label>
              <Textarea
                rows={3}
                value={noteRecs}
                onChange={(e) => setNoteRecs(e.target.value)}
                placeholder="Use SPF daily&#10;Return in 4 weeks"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNote(false)} disabled={createNote.isPending}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={createNote.isPending || !noteObs.trim()}>
                {createNote.isPending ? "Saving..." : "Add Note"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeactivate}
        onOpenChange={setShowDeactivate}
        title="Deactivate client?"
        description="This client will be hidden from the active list. This can be reversed in the database."
        confirmLabel="Deactivate"
        destructive
        loading={deactivateClient.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
