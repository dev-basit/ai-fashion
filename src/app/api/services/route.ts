import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerClient } from "@/services/supabase-server";
import { withAuth } from "@/lib/api-handlers";

export async function GET() {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*, service_categories(id, name), service_variants(*)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export const POST = withAuth(async (request: NextRequest, { supabase }) => {
  const body = await request.json();
  const { data, error } = await supabase.from("services").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
