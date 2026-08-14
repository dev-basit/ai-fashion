"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { clientSchema, type ClientFormData } from "@/types/schemas/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import type { ClientFormProps } from "@/types/props";

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const isEdit = !!client;
  const [error, setError] = useState<string | null>(null);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: client?.full_name ?? "",
      phone: client?.phone ?? "",
      date_of_birth: client?.date_of_birth ?? "",
      notes: client?.notes ?? "",
    },
  });

  const onSubmit = async (values: ClientFormData) => {
    setError(null);

    if (!isEdit) {
      if (!values.email) {
        setError("Email is required");
        return;
      }
      if (!values.password || values.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    if (isEdit) {
      try {
        await updateClient.mutateAsync({
          id: client!.id,
          full_name: values.full_name,
          phone: values.phone || null,
          date_of_birth: values.date_of_birth || null,
          notes: values.notes || null,
        });
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    } else {
      try {
        await createClient.mutateAsync({
          email: values.email,
          password: values.password,
          full_name: values.full_name,
          phone: values.phone || null,
          date_of_birth: values.date_of_birth || null,
          notes: values.notes || null,
        });
      } catch (e: unknown) {
        const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Failed to create client");
        return;
      }
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Full Name</Label>
        <Input placeholder="Jane Smith" {...register("full_name")} />
        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
      </div>

      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="client@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="text" placeholder="Min 6 characters" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input placeholder="+1 (555) 000-0000" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label>Date of Birth</Label>
          <DatePicker value={watch("date_of_birth") ?? ""} onChange={(v) => setValue("date_of_birth", v)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes / Preferences</Label>
        <Textarea rows={3} placeholder="Allergies, preferences, VIP status..." {...register("notes")} />
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Client"}
        </Button>
      </div>
    </form>
  );
}
