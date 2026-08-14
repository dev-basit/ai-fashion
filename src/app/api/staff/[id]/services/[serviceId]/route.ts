import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const DELETE = withAuth(async (_req, { supabase }, { params }) => {
  const { id, serviceId } = await params;
  const { error } = await supabase
    .from("staff_services")
    .delete()
    .eq("staff_profile_id", id)
    .eq("service_id", serviceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});
