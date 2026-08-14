import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const POST = withAuth(async (_req, { user, supabase }, { params }) => {
  const { id } = await params;
  const { error } = await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .eq("profile_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});
