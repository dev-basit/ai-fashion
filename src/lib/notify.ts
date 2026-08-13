import { getAdminClient } from "@/services/supabase-admin";
import type { NotificationType } from "@/types/database";

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

// Insert notifications for a set of profile IDs (deduped). Uses admin client to bypass RLS.
async function insertNotifications(profileIds: string[], payload: NotificationPayload) {
  const unique = [...new Set(profileIds.filter(Boolean))];
  if (unique.length === 0) return;
  const admin = getAdminClient();
  await admin.from("notifications").insert(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unique.map((profile_id) => ({ profile_id, ...payload })) as any,
  );
}

// Returns profile IDs of all active admins.
async function getAdminProfileIds(): Promise<string[]> {
  const admin = getAdminClient();
  const { data } = await admin.from("profiles").select("id").eq("role", "admin").eq("is_active", true);
  return (data ?? []).map((r) => r.id);
}

// Notify a specific user + all admins (admin deduped if they are the actor).
export async function notifyUserAndAdmins(
  recipientId: string | null,
  payload: NotificationPayload,
  excludeId?: string,
) {
  const adminIds = await getAdminProfileIds();
  const ids = [...(recipientId ? [recipientId] : []), ...adminIds].filter((id) => id !== excludeId);
  await insertNotifications(ids, payload);
}

// Notify only admins.
export async function notifyAdmins(payload: NotificationPayload, excludeId?: string) {
  const adminIds = await getAdminProfileIds();
  await insertNotifications(
    adminIds.filter((id) => id !== excludeId),
    payload,
  );
}
