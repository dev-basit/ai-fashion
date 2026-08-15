"use client";

import { useState } from "react";
import { Plus, List, CalendarDays } from "lucide-react";
import { useAppointments } from "@/hooks/useAppointments";
import type { Appointment } from "@/types/database";
import { useAppointmentsStore } from "@/store/appointments.store";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentList } from "./AppointmentList";
import { AppointmentCalendar } from "./AppointmentCalendar";
import { AppointmentForm } from "./AppointmentForm";
import { AppointmentFilters } from "./AppointmentFilters";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AppointmentsViewProps } from "@/types/props";

export function AppointmentsView({ role, userId, staffProfileId }: AppointmentsViewProps) {
  const [showForm, setShowForm] = useState(false);
  const { view, setView, statusFilter, staffFilter, serviceFilter } = useAppointmentsStore();

  const filters = {
    ...(role === "customer" ? { clientId: userId } : {}),
    ...(role === "staff" && staffProfileId ? { staffProfileId } : {}),
    ...(role === "admin" && staffFilter ? { staffProfileId: staffFilter } : {}),
    ...(serviceFilter ? { serviceId: serviceFilter } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const { data: appointmentsRaw, isLoading, refetch } = useAppointments(filters);
  const appointments = (appointmentsRaw ?? []) as Appointment[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={
          role === "admin"
            ? "Manage all salon appointments"
            : role === "staff"
              ? "Your assigned appointments"
              : "Your upcoming bookings"
        }
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {role === "customer" ? "Book Appointment" : "New Appointment"}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "calendar")}>
          <TabsList>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-1" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays className="h-4 w-4 mr-1" />
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {role !== "customer" && <AppointmentFilters showProvider={role === "admin"} />}
      </div>

      {isLoading ? (
        <PageLoading />
      ) : view === "calendar" ? (
        <AppointmentCalendar appointments={appointments} />
      ) : (
        <AppointmentList appointments={appointments} isLoading={false} role={role} onRefresh={refetch} />
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{role === "customer" ? "Book Appointment" : "New Appointment"}</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            userRole={role}
            clientId={role === "customer" ? userId : undefined}
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
