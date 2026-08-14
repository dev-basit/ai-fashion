import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAdmin } from "@/lib/api-handlers";

export const GET = withAdmin(async (request: NextRequest, { supabase }) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const from = searchParams.get("from") ?? new Date(0).toISOString();
  const to = searchParams.get("to") ?? new Date().toISOString();
  const db = supabase;

  if (type === "revenue") {
    const { data, error } = await db
      .from("appointments")
      .select("price, discount, status, starts_at")
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .gte("starts_at", from)
      .lte("starts_at", to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (type === "appointments") {
    const { data, error } = await db
      .from("appointments")
      .select("status, starts_at, service_id, services(name)")
      .gte("starts_at", from)
      .lte("starts_at", to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (type === "clients") {
    const { data, error } = await db
      .from("profiles")
      .select("id, created_at, role")
      .eq("role", "customer")
      .gte("created_at", from)
      .lte("created_at", to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (type === "staff") {
    const { data, error } = await db
      .from("appointments")
      .select("staff_profile_id, status, price, staff_profiles(profiles(full_name))")
      .eq("status", "completed")
      .gte("starts_at", from)
      .lte("starts_at", to)
      .not("staff_profile_id", "is", null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (type === "orders") {
    const { data, error } = await db
      .from("orders")
      .select("total_amount, created_at")
      .not("status", "in", '("cancelled","refunded")')
      .gte("created_at", from)
      .lte("created_at", to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (type === "products") {
    const { data, error } = await db
      .from("order_items")
      .select("quantity, unit_price, product_id, products(name), orders!inner(status, created_at)")
      .eq("orders.status", "delivered")
      .gte("orders.created_at", from)
      .lte("orders.created_at", to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (type === "dashboard") {
    const [rangeAppointments, pendingCount, totalClients, rangeRevenue, rangeOrders] = await Promise.all([
      db.from("appointments").select("id, status", { count: "exact" }).gte("starts_at", from).lte("starts_at", to),
      db.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer").eq("is_active", true),
      db
        .from("appointments")
        .select("price, discount")
        .eq("status", "completed")
        .eq("payment_status", "paid")
        .gte("starts_at", from)
        .lte("starts_at", to),
      db
        .from("orders")
        .select("total_amount")
        .not("status", "in", '("cancelled","refunded")')
        .gte("created_at", from)
        .lte("created_at", to),
    ]);

    const appointmentRevenue = (rangeRevenue.data ?? []).reduce(
      (sum: number, a) => sum + ((a.price ?? 0) - (a.discount ?? 0)),
      0,
    );
    const orderRevenue = (rangeOrders.data ?? []).reduce((sum: number, o) => sum + (o.total_amount ?? 0), 0);

    return NextResponse.json({
      data: {
        appointmentsCount: rangeAppointments.count ?? 0,
        pendingAppointmentsCount: pendingCount.count ?? 0,
        totalClientsCount: totalClients.count ?? 0,
        appointmentRevenue,
        orderRevenue,
        revenue: appointmentRevenue + orderRevenue,
      },
    });
  }

  return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
});
