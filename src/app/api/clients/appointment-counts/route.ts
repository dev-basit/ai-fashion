import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";

export const GET = withAuth(async () => {
  const { data, error } = await getAdminClient().from("appointments").select("client_id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const counts: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    counts[row.client_id] = (counts[row.client_id] ?? 0) + 1;
  });
  return NextResponse.json({ data: counts });
});
