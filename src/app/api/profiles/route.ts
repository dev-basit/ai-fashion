import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-handlers";

export const GET = withAdmin(async (_request, { supabase }) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});
