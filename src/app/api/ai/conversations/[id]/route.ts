import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const DELETE = withAuth(async (_req, { supabase }, ctx) => {
  const { id } = await ctx.params;

  // RLS policy (ai_conversations_own) ensures only the owner can delete their row.
  // If the row doesn't belong to the user, delete returns count=0 — treat as 404.
  const { error, count } = await (supabase as any)
    .from("ai_conversations")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
});
