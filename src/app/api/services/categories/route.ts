import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_: NextRequest, { supabase }) => {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (request: NextRequest, { supabase }) => {
  const body = await request.json();
  const { data, error } = await supabase.from("service_categories").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
