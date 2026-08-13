import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_request, { supabase }, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
});

export const PATCH = withAuth(async (request, { supabase }, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { data, error } = await supabase.from("profiles").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});
