import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_req, { supabase }, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from("staff_schedules")
    .select("*")
    .eq("staff_profile_id", id)
    .order("day_of_week", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const PUT = withAuth(async (req, { supabase }, { params }) => {
  const { id } = await params;
  const schedules = await req.json();
  const rows = (Array.isArray(schedules) ? schedules : [schedules]).map((s: Record<string, unknown>) => ({
    ...s,
    staff_profile_id: id,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("staff_schedules")
    .upsert(rows as any, { onConflict: "staff_profile_id,day_of_week" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});
