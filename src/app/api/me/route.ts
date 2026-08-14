import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_req, { user, supabase }) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, avatar_url, date_of_birth, created_at")
    .eq("id", user.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { ...data, email: user.email ?? null } });
});
