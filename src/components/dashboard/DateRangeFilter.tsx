"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { DateRange } from "@/services/reports.service";

export type DatePreset = "today" | "7d" | "30d" | "custom";

const PRESET_LABELS: Record<DatePreset, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last Month",
  custom: "Custom Range",
};

export const PRESET_RANGE_LABEL: Record<DatePreset, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  custom: "Selected Period",
};

export function computeDateRange(preset: DatePreset, customFrom = "", customTo = ""): DateRange {
  const now = new Date();
  if (preset === "today") {
    const s = new Date(now);
    s.setHours(0, 0, 0, 0);
    const e = new Date(now);
    e.setHours(23, 59, 59, 999);
    return { from: s.toISOString(), to: e.toISOString() };
  }
  if (preset === "7d") {
    const e = new Date(now);
    e.setHours(23, 59, 59, 999);
    const s = new Date(now);
    s.setDate(s.getDate() - 6);
    s.setHours(0, 0, 0, 0);
    return { from: s.toISOString(), to: e.toISOString() };
  }
  if (preset === "30d") {
    const e = new Date(now);
    e.setHours(23, 59, 59, 999);
    const s = new Date(now);
    s.setDate(s.getDate() - 29);
    s.setHours(0, 0, 0, 0);
    return { from: s.toISOString(), to: e.toISOString() };
  }
  return {
    from: customFrom ? new Date(customFrom + "T00:00:00").toISOString() : "",
    to: customTo ? new Date(customTo + "T23:59:59").toISOString() : "",
  };
}

type DateRangeFilterProps = {
  preset: DatePreset;
  onChange: (preset: DatePreset, range: DateRange) => void;
};

export function DateRangeFilter({ preset, onChange }: DateRangeFilterProps) {
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const handlePreset = (v: unknown) => {
    const p = String(v ?? "today") as DatePreset;
    onChange(p, computeDateRange(p, customFrom, customTo));
  };

  const handleFrom = (from: string) => {
    setCustomFrom(from);
    onChange("custom", computeDateRange("custom", from, customTo));
  };

  const handleTo = (to: string) => {
    setCustomTo(to);
    onChange("custom", computeDateRange("custom", customFrom, to));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={preset}
        items={Object.fromEntries(Object.entries(PRESET_LABELS) as [string, string][])}
        onValueChange={handlePreset}
      >
        <SelectTrigger className="h-8 text-xs w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(PRESET_LABELS) as [DatePreset, string][]).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <>
          <DatePicker value={customFrom} onChange={handleFrom} placeholder="From" className="h-8 text-xs w-36" />
          <span className="text-xs text-muted-foreground">to</span>
          <DatePicker value={customTo} onChange={handleTo} placeholder="To" className="h-8 text-xs w-36" />
        </>
      )}
    </div>
  );
}
