import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const POST = withAuth(async (req, { supabase }, { params }) => {
  const { id } = await params;
  const { service_id } = await req.json();
  const { error } = await supabase
    .from("staff_services")
    .insert({ staff_profile_id: id, service_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
});
