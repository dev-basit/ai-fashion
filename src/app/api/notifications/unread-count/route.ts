import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_req, { user, supabase }) => {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { count: count ?? 0 } });
});
