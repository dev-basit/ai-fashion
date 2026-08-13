import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerClient } from "@/services/supabase-server";
import { withAdmin } from "@/lib/api-handlers";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerClient();
  const { data, error } = await supabase.from("products").select("*, product_categories(*)").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export const PATCH = withAdmin(async (request: NextRequest, { supabase }, { params }) => {
  const { id } = await params;
  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("products")
    .update(body as any)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const DELETE = withAdmin(async (_request, { supabase }, { params }) => {
  const { id } = await params;
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
});
