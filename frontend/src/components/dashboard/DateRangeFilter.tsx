"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DATE_PRESET_LABELS } from "@/config/constants";
import { computeDateRange } from "@/utils/date";
import type { DateRange } from "@/services/reports.service";
import type { DatePreset } from "@/types/database";

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
        items={Object.fromEntries(Object.entries(DATE_PRESET_LABELS) as [string, string][])}
        onValueChange={handlePreset}
      >
        <SelectTrigger className="h-8 text-xs w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(DATE_PRESET_LABELS) as [DatePreset, string][]).map(([value, label]) => (
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
