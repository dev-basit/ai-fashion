import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerClient } from "@/services/supabase-server";
import { withAuth } from "@/lib/api-handlers";

export async function GET(request: NextRequest) {
  const supabase = await getServerClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const categoryId = searchParams.get("categoryId");

  let query = supabase
    .from("products")
    .select("*, product_categories(id, name)")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (search) query = query.ilike("name", `%${search}%`);
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export const POST = withAuth(async (request: NextRequest, { supabase }) => {
  const body = await request.json();
  const { data, error } = await supabase.from("products").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
