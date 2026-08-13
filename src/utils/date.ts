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
