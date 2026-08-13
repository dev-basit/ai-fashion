import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerClient } from "@/services/supabase-server";
import { withAdmin } from "@/lib/api-handlers";

export async function GET() {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export const POST = withAdmin(async (request: NextRequest, { supabase }) => {
  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("product_categories")
    .insert(body as any)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
