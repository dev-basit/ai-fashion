"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentsService } from "@/services/appointments.service";
import { appointmentSchema, type AppointmentFormData } from "@/types/schemas/appointment";
import { servicesService } from "@/services/services.service";
import { staffService } from "@/services/staff.service";
import { clientsService } from "@/services/clients.service";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-picker";
import type { AppointmentFormProps } from "@/types/props";
import type { Service, StaffProfile, Profile } from "@/types/database";


/** ISO string → value for <input type="datetime-local"> in local time */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function AppointmentForm({ userRole, clientId, appointment, onSuccess, onCancel }: AppointmentFormProps) {
  const isEdit = !!appointment;
  const userId = useAuthStore((s) => s.user?.id);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [staffResolved, setStaffResolved] = useState(userRole !== "staff");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      client_id: appointment?.client_id ?? clientId ?? "",
      service_id: appointment?.service_id ?? "",
      staff_profile_id: appointment?.staff_profile_id ?? "",
      starts_at: appointment ? toLocalInput(appointment.starts_at) : "",
      notes: appointment?.notes ?? ""
    }
  });

  useEffect(() => {
    servicesService.getAllServices().then(({ data }) => setServices((data as unknown as Service[]) ?? []));

    if (userRole === "staff") {
      // Auto-resolve logged-in staff member's profile — no dropdown shown
      if (userId) {
        staffService.getByProfileId(userId).then(({ data }) => {
          if (data) {
            setValue("staff_profile_id", data.id);
          }
          setStaffResolved(true);
        });
      }
    } else {
      // Admin / customer: load full staff list
      staffService.getAll().then(({ data }) => setStaffList((data as unknown as StaffProfile[]) ?? []));
    }

    if (!clientId && !isEdit) {
      clientsService.getAll().then(({ data }) => setClients(data ?? []));
    }
  }, [clientId, isEdit, userRole, userId, setValue]);

  const onSubmit = async (data: AppointmentFormData) => {
    setSubmitting(true);
    setError(null);
    const service = services.find((s) => s.id === data.service_id);
    if (!service) {
      setError("Please select a valid service");
      setSubmitting(false);
      return;
    }

    const startsAt = new Date(data.starts_at);
    const endsAt = new Date(startsAt.getTime() + service.duration_mins * 60000);

    const payload = {
      client_id: data.client_id,
      service_id: data.service_id,
      staff_profile_id: data.staff_profile_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      price: service.base_price,
      notes: data.notes || null
    };

    let err: { message: string } | null = null;
    if (isEdit) {
      const { error } = await appointmentsService.update(appointment!.id, payload);
      err = error;
    } else {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, status: "pending", payment_status: "unpaid" })
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        err = { message: json.error ?? "Failed to create appointment" };
      }
    }

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!clientId && !isEdit && (
        <div className="space-y-1.5">
          <Label>Client</Label>
          <Select
            items={Object.fromEntries(clients.map((c) => [c.id, c.full_name ?? "Client"]))}
            onValueChange={(v: unknown) => setValue("client_id", String(v ?? ""))}
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
          {errors.client_id && <p className="text-xs text-destructive">{errors.client_id.message}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Service</Label>
        <Select
          defaultValue={appointment?.service_id}
          items={Object.fromEntries(
            services.map((s) => [s.id, `${s.name} — $${s.base_price} (${s.duration_mins}m)`]),
          )}
          onValueChange={(v: unknown) => setValue("service_id", String(v ?? ""))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — ${s.base_price} ({s.duration_mins}m)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service_id && <p className="text-xs text-destructive">{errors.service_id.message}</p>}
      </div>

      {/* Staff selector — hidden for staff role (auto-assigned to self) */}
      {userRole !== "staff" && (
        <div className="space-y-1.5">
          <Label>Staff</Label>
          <Select
            defaultValue={appointment?.staff_profile_id ?? undefined}
            items={Object.fromEntries(
              staffList.map((s) => [
                s.id,
                (s as StaffProfile & { profiles?: { full_name?: string } }).profiles?.full_name ?? "Staff",
              ]),
            )}
            onValueChange={(v: unknown) => setValue("staff_profile_id", String(v ?? ""))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {(s as StaffProfile & { profiles?: { full_name?: string } }).profiles?.full_name ?? "Staff"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.staff_profile_id && (
            <p className="text-xs text-destructive">{errors.staff_profile_id.message}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Date & Time</Label>
        <DateTimePicker
          value={watch("starts_at")}
          onChange={(v) => setValue("starts_at", v, { shouldValidate: true })}
        />
        {errors.starts_at && <p className="text-xs text-destructive">{errors.starts_at.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea rows={3} placeholder="Any special requests..." {...register("notes")} />
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || !staffResolved}>
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Book Appointment"}
        </Button>
      </div>
    </form>
  );
}
