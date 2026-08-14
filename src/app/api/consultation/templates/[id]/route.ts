import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_req, { supabase }, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase.from("consultation_form_templates").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
});

export const PATCH = withAuth(async (req, { supabase }, { params }) => {
  const { id } = await params;
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("consultation_form_templates")
    .update(body as any)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});
