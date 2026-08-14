import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { AiMessage } from "@/types/database";
import type { AIChatMessage } from "@/types/props";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toAIChatMessage(m: AiMessage): AIChatMessage {
  return { id: m.id, role: m.role as "user" | "assistant", content: m.content };
}

export function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const responseData = (data: any) => ({ data, error: null });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const responseError = (e: any) => ({
  data: null,
  error: { message: e?.response?.data?.error ?? e?.message ?? "Unknown error" },
});
