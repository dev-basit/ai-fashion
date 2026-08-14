import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const PATCH = withAuth(async (req, { supabase }, { params }) => {
  const { id } = await params;
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from("service_categories").update(body as any).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const DELETE = withAuth(async (_req, { supabase }, { params }) => {
  const { id } = await params;
  const { error } = await supabase.from("service_categories").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});
