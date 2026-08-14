import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-handlers";

export const GET = withAuth(async (_req, { supabase }, { params }) => {
  const { id } = await params;

  const [appointments, orders, consultations, plans] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, services(name, base_price), staff_profiles(profiles(full_name))")
      .eq("client_id", id)
      .order("starts_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*, order_items(*, products(name))")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("consultation_records")
      .select("*, consultation_form_templates(name), staff_profiles(profiles(full_name))")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("client_treatment_plans")
      .select("*, treatment_plan_templates(name)")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    data: {
      appointments: appointments.data ?? [],
      orders: orders.data ?? [],
      consultations: consultations.data ?? [],
      plans: plans.data ?? [],
    },
  });
});
