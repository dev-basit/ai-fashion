import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const POST = withAuth(async (_request, { user, supabase }, { params }) => {
  const { id } = await params;
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("profile_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});
