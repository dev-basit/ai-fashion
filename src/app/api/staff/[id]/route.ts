import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";

export const GET = withAuth(async (_request, _auth, { params }) => {
  const { id } = await params;
  const { data, error } = await getAdminClient()
    .from("staff_profiles")
    .select("*, profiles(*), staff_services(services(*))")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
});

export const PATCH = withAuth(async (request, { supabase }, { params }) => {
  const { id } = await params;
  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase
    .from("staff_profiles")
    .update(body as any)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});
