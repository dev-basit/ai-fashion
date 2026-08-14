import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_req, { supabase }, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from("service_variants")
    .select("*")
    .eq("service_id", id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (req, { supabase }, { params }) => {
  const { id } = await params;
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("service_variants")
    .insert({ ...body, service_id: id } as any)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
