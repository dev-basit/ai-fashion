"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateService, useUpdateService } from "@/hooks/useServices";
import { serviceSchema, type ServiceFormData } from "@/types/schemas/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ServiceFormProps } from "@/types/props";

export function ServiceForm({ service, categories, onSuccess, onCancel }: ServiceFormProps) {
  const isEdit = !!service;
  const [categoryId, setCategoryId] = useState<string>(service?.category_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const createService = useCreateService();
  const updateService = useUpdateService();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? "",
      description: service?.description ?? "",
      base_price: service ? String(service.base_price) : "",
      duration_mins: service ? String(service.duration_mins) : "",
      instructions: service?.instructions ?? "",
    },
  });

  const onSubmit = async (values: ServiceFormData) => {
    setError(null);
    const payload = {
      name: values.name,
      description: values.description || null,
      base_price: parseFloat(values.base_price),
      duration_mins: parseInt(values.duration_mins),
      instructions: values.instructions || null,
      category_id: categoryId || null,
      is_active: true,
    };
    try {
      if (isEdit) await updateService.mutateAsync({ id: service!.id, ...payload });
      else await createService.mutateAsync(payload);
      onSuccess();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input placeholder="e.g. Deep Cleansing Facial" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={2} {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Price ($)</Label>
          <Input type="number" min="0" step="0.01" {...register("base_price")} />
          {errors.base_price && <p className="text-xs text-destructive">{errors.base_price.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Duration (min)</Label>
          <Input type="number" min="1" {...register("duration_mins")} />
          {errors.duration_mins && <p className="text-xs text-destructive">{errors.duration_mins.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          value={categoryId || undefined}
          items={Object.fromEntries(categories.map((c) => [c.id, c.name]))}
          onValueChange={(v: unknown) => setCategoryId(v ? String(v) : "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Instructions (optional)</Label>
        <Textarea rows={2} placeholder="Pre/post-care instructions..." {...register("instructions")} />
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Service"}
        </Button>
      </div>
    </form>
  );
}
