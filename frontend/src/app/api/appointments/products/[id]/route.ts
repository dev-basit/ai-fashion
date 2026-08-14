import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const DELETE = withAuth(async (_req, { supabase }, { params }) => {
  const { id } = await params;
  const { error } = await supabase.from("appointment_products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
});
