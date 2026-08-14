"use client";

import type { StaffScheduleGridProps, StaffScheduleRow } from "@/types/props";

import { useState, useEffect } from "react";
import { useStaffSchedule, useUpsertSchedule } from "@/hooks/useStaff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DAYS_OF_WEEK } from "@/config/constants";
import type { StaffSchedule } from "@/types/database";


const DEFAULT_ROWS: StaffScheduleRow[] = DAYS_OF_WEEK.map((_, i) => ({
  day_of_week: i,
  start_time: "09:00",
  end_time: "17:00",
  is_working: i !== 0,
}));

export function StaffScheduleGrid({ staffProfileId, editable = true }: StaffScheduleGridProps) {
  const [rows, setRows] = useState<StaffScheduleRow[]>(DEFAULT_ROWS);
  const [saved, setSaved] = useState(false);

  const { data: scheduleData } = useStaffSchedule(staffProfileId);
  const upsertSchedule = useUpsertSchedule();

  useEffect(() => {
    if (scheduleData && (scheduleData as StaffSchedule[]).length) {
      const byDay = new Map((scheduleData as StaffSchedule[]).map((s) => [s.day_of_week, s]));
      setRows(
        DEFAULT_ROWS.map((d) => {
          const existing = byDay.get(d.day_of_week);
          return existing
            ? {
                day_of_week: d.day_of_week,
                start_time: existing.start_time.slice(0, 5),
                end_time: existing.end_time.slice(0, 5),
                is_working: existing.is_working,
              }
            : d;
        }),
      );
    }
  }, [scheduleData]);

  const update = (day: number, patch: Partial<StaffScheduleRow>) => {
    setRows((prev) => prev.map((r) => (r.day_of_week === day ? { ...r, ...patch } : r)));
  };

  const save = () => {
    upsertSchedule.mutate(
      rows.map((r) => ({
        staff_profile_id: staffProfileId,
        day_of_week: r.day_of_week,
        start_time: r.start_time,
        end_time: r.end_time,
        is_working: r.is_working,
      })),
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.day_of_week} className="flex items-center gap-3">
            <span className="w-24 text-sm">{DAYS_OF_WEEK[r.day_of_week]}</span>
            <Switch
              checked={r.is_working}
              onCheckedChange={(c) => update(r.day_of_week, { is_working: c })}
              disabled={!editable}
            />
            {r.is_working ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  className="h-8 w-28"
                  value={r.start_time}
                  onChange={(e) => update(r.day_of_week, { start_time: e.target.value })}
                  disabled={!editable}
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="time"
                  className="h-8 w-28"
                  value={r.end_time}
                  onChange={(e) => update(r.day_of_week, { end_time: e.target.value })}
                  disabled={!editable}
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Off</span>
            )}
          </div>
        ))}
      </div>
      {editable && (
        <Button size="sm" onClick={save} disabled={upsertSchedule.isPending}>
          {upsertSchedule.isPending ? "Saving..." : saved ? "Saved!" : "Save Schedule"}
        </Button>
      )}
    </div>
  );
}
