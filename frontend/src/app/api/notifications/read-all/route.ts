import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const POST = withAuth(async (_req, { user, supabase }) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});
