import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInMinutes,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import type { DatePreset } from "@/types/database";
import type { DateRange } from "@/services/reports.service";

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "h:mm a");
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy h:mm a");
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy h:mm a");
}

export function getAppointmentEndTime(startsAt: string | Date, durationMins: number): Date {
  const start = typeof startsAt === "string" ? parseISO(startsAt) : startsAt;
  return addMinutes(start, durationMins);
}

export function getDayRange(date: Date) {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function getWeekRange(date: Date) {
  return { start: startOfWeek(date), end: endOfWeek(date) };
}

export function getMonthRange(date: Date) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function minutesBetween(start: string | Date, end: string | Date): number {
  const s = typeof start === "string" ? parseISO(start) : start;
  const e = typeof end === "string" ? parseISO(end) : end;
  return differenceInMinutes(e, s);
}

export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

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
