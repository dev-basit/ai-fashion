"use client";

import { useState } from "react";
import { useUpdateStaff } from "@/hooks/useStaff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import type { StaffFormProps } from "@/types/props";


export function StaffForm({ staff, onSuccess, onCancel }: StaffFormProps) {
  const isEdit = !!staff;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(staff?.profiles?.full_name ?? "");
  const [phone, setPhone] = useState(staff?.profiles?.phone ?? "");
  const [bio, setBio] = useState(staff?.bio ?? "");
  const [specializations, setSpecializations] = useState((staff?.specializations ?? []).join(", "));
  const [certifications, setCertifications] = useState((staff?.certifications ?? []).join(", "));
  const [hireDate, setHireDate] = useState(staff?.hire_date ?? "");
  const [hourlyRate, setHourlyRate] = useState(staff?.hourly_rate?.toString() ?? "");
  const [commissionRate, setCommissionRate] = useState(staff?.commission_rate?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const updateStaff = useUpdateStaff();

  const toArray = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const submit = async () => {
    setError(null);

    if (isEdit) {
      try {
        await updateStaff.mutateAsync({
          id: staff!.id,
          bio: bio || null,
          specializations: toArray(specializations).length ? toArray(specializations) : null,
          certifications: toArray(certifications).length ? toArray(certifications) : null,
          hire_date: hireDate || null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          commission_rate: commissionRate ? parseFloat(commissionRate) : null,
        });
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    } else {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          phone,
          bio,
          specializations: toArray(specializations),
          certifications: toArray(certifications),
          hire_date: hireDate || null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          commission_rate: commissionRate ? parseFloat(commissionRate) : null,
        }),
      });
      if (!res.ok) {
        let j: Record<string, unknown> = {};
        try { j = await res.json(); } catch { /* ignore */ }
        setError((j.error as string) ?? "Failed to create staff");
        return;
      }
    }

    onSuccess();
  };

  const saving = updateStaff.isPending;
  const canSubmit = isEdit || (!!email && !!password && !!fullName);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isEdit} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isEdit} />
        </div>
      </div>

      {!isEdit && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@salon.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea
          rows={2}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief professional background..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          Specializations <span className="text-muted-foreground font-normal">(comma-separated)</span>
        </Label>
        <Input
          value={specializations}
          onChange={(e) => setSpecializations(e.target.value)}
          placeholder="Facials, Chemical Peels, Anti-Aging"
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          Certifications <span className="text-muted-foreground font-normal">(comma-separated)</span>
        </Label>
        <Input
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          placeholder="Licensed Esthetician, Advanced Peel Certification"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Hire Date</Label>
          <DatePicker value={hireDate} onChange={setHireDate} />
        </div>
        <div className="space-y-1.5">
          <Label>Hourly Rate ($)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="45.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Commission (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            placeholder="15"
          />
        </div>
      </div>

      {isEdit && (
        <p className="text-xs text-muted-foreground">
          Name, email and phone are managed in the staff member&apos;s own settings.
        </p>
      )}

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={saving || !canSubmit}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Staff"}
        </Button>
      </div>
    </div>
  );
}
