"use client";

import type { ServiceVariantManagerProps } from "@/types/props";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useServiceVariants, useCreateServiceVariant, useDeleteServiceVariant } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ServiceVariant } from "@/types/database";

export function ServiceVariantManager({ serviceId }: ServiceVariantManagerProps) {
  const { data: variantsRaw } = useServiceVariants(serviceId);
  const variants = (variantsRaw ?? []) as ServiceVariant[];
  const createVariant = useCreateServiceVariant();
  const deleteVariant = useDeleteServiceVariant();

  const [name, setName] = useState("");
  const [priceMod, setPriceMod] = useState("");
  const [durationMod, setDurationMod] = useState("");

  const addVariant = () => {
    if (!name.trim()) return;
    createVariant.mutate(
      {
        serviceId,
        name: name.trim(),
        price_modifier: parseFloat(priceMod) || 0,
        duration_modifier: parseInt(durationMod) || 0,
        is_active: true,
      },
      {
        onSuccess: () => {
          setName("");
          setPriceMod("");
          setDurationMod("");
        },
      },
    );
  };

  const removeVariant = (id: string) => {
    deleteVariant.mutate({ variantId: id, serviceId });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {variants.length === 0 && <p className="text-sm text-muted-foreground">No variants yet.</p>}
        {variants.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-md border border-border p-2.5">
            <div className="text-sm">
              <span className="font-medium">{v.name}</span>
              <span className="text-muted-foreground ml-2">
                {v.price_modifier >= 0 ? "+" : ""}
                {v.price_modifier} · {v.duration_modifier >= 0 ? "+" : ""}
                {v.duration_modifier}m
              </span>
            </div>
            <Button size="icon" variant="ghost" onClick={() => removeVariant(v.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border p-3 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Variant name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Long hair" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Price modifier ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={priceMod}
              onChange={(e) => setPriceMod(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Duration modifier (min)</Label>
            <Input
              type="number"
              value={durationMod}
              onChange={(e) => setDurationMod(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <Button
          size="sm"
          onClick={addVariant}
          disabled={createVariant.isPending || !name.trim()}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Variant
        </Button>
      </div>
    </div>
  );
}
