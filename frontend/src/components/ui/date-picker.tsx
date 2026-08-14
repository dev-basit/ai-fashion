"use client";

import type { DatePickerProps, DateTimePickerProps } from "@/types/props";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayDateTime(str: string): string {
  if (!str) return "";
  const [datePart, timePart] = str.split("T");
  if (!datePart) return "";
  const dateDisplay = formatDisplayDate(datePart);
  if (!timePart) return dateDisplay;
  const [h, min] = timePart.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${dateDisplay} at ${hour}:${String(min).padStart(2, "0")} ${suffix}`;
}

// ---------- DatePicker ----------


export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const selected = value
    ? (() => {
        const [y, m, d] = value.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left">{value ? formatDisplayDate(value) : placeholder}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(date ? toDateStr(date) : "")}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ---------- DateTimePicker ----------


export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  className,
  disabled,
}: DateTimePickerProps) {
  const datePart = value ? value.split("T")[0] : "";
  const timePart = value ? (value.split("T")[1] ?? "09:00") : "09:00";

  const selected = datePart
    ? (() => {
        const [y, m, d] = datePart.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }
    onChange(`${toDateStr(date)}T${timePart}`);
  };

  const handleTimeChange = (t: string) => {
    if (!datePart) return;
    onChange(`${datePart}T${t}`);
  };

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left">{value ? formatDisplayDateTime(value) : placeholder}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={handleDateSelect} autoFocus />
        <div className="border-t border-border p-3 space-y-1.5">
          <p className="text-xs text-muted-foreground">Time</p>
          <Input
            type="time"
            value={timePart}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
