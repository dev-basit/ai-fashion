import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_req, { supabase }, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from("appointment_products")
    .select("*, products(id, name, stock_quantity)")
    .eq("appointment_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (req, { supabase }, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabase
    .from("appointment_products")
    .insert({ ...body, appointment_id: id })
    .select("*, products(name)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
