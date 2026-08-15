"use client";

import type { StaffLeaveCalendarProps } from "@/types/props";

import { useState } from "react";
import { Plus, CalendarOff } from "lucide-react";
import { useStaffLeaves, useCreateLeave } from "@/hooks/useStaff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDate } from "@/utils/date";
import type { StaffLeave } from "@/types/database";

export function StaffLeaveCalendar({ staffProfileId, editable = true }: StaffLeaveCalendarProps) {
  const [showForm, setShowForm] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");

  const { data: leavesRaw } = useStaffLeaves(staffProfileId);
  const leaves = (leavesRaw ?? []) as StaffLeave[];
  const createLeave = useCreateLeave();

  const add = () => {
    if (!start || !end) return;
    createLeave.mutate(
      { staff_profile_id: staffProfileId, starts_at: start, ends_at: end, reason: reason || undefined },
      {
        onSuccess: () => {
          setStart("");
          setEnd("");
          setReason("");
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="space-y-3">
      {leaves.length === 0 ? (
        <p className="text-sm text-muted-foreground">No leave scheduled.</p>
      ) : (
        <div className="space-y-2">
          {leaves.map((l) => (
            <div key={l.id} className="flex items-center gap-2 rounded-md border border-border p-2.5 text-sm">
              <CalendarOff className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatDate(l.starts_at)} – {formatDate(l.ends_at)}
              </span>
              {l.reason && <span className="text-muted-foreground">· {l.reason}</span>}
            </div>
          ))}
        </div>
      )}

      {editable && !showForm && (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Request Leave
        </Button>
      )}

      {editable && showForm && (
        <div className="rounded-md border border-border p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <DatePicker value={start} onChange={setStart} placeholder="Start date" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <DatePicker value={end} onChange={setEnd} placeholder="End date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Reason (optional)</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={add} disabled={createLeave.isPending || !start || !end}>
              {createLeave.isPending ? "Saving..." : "Add"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
