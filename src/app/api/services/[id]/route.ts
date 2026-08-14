import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerClient } from "@/services/supabase-server";
import { withAuth } from "@/lib/api-handlers";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*, service_categories(*), service_variants(*)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export const PATCH = withAuth(async (request: NextRequest, { supabase }, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { data, error } = await supabase.from("services").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const DELETE = withAuth(async (_request, { supabase }, { params }) => {
  const { id } = await params;
  const { error } = await supabase.from("services").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});
