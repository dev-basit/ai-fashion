import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_request, { supabase }) => {
  const { data, error } = await supabase.from("business_settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const PATCH = withAuth(async (request: NextRequest, { user, supabase }) => {
  const { key, value } = await request.json();
  const { data, error } = await supabase
    .from("business_settings")
    .update({ value, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("key", key)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});
