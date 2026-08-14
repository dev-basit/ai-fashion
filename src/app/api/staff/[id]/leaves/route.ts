import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_req, { supabase }, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from("staff_leaves")
    .select("*")
    .eq("staff_profile_id", id)
    .order("starts_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (req, { supabase }, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabase
    .from("staff_leaves")
    .insert({ ...body, staff_profile_id: id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
});
