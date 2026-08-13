import { getBrowserClient } from "./supabase";

export interface DateRange {
  from: string;
  to: string;
}

export const reportsService = {
  async getRevenueStats(range: DateRange) {
    const supabase = getBrowserClient();
    return supabase
      .from("appointments")
      .select("price, discount, status, starts_at")
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .gte("starts_at", range.from)
      .lte("starts_at", range.to);
  },

  async getAppointmentStats(range: DateRange) {
    const supabase = getBrowserClient();
    return supabase
      .from("appointments")
      .select("status, starts_at, service_id, services(name)")
      .gte("starts_at", range.from)
      .lte("starts_at", range.to);
  },

  async getClientStats(range: DateRange) {
    const supabase = getBrowserClient();
    return supabase
      .from("profiles")
      .select("id, created_at, role")
      .eq("role", "customer")
      .gte("created_at", range.from)
      .lte("created_at", range.to);
  },

  async getStaffPerformance(range: DateRange) {
    const supabase = getBrowserClient();
    return supabase
      .from("appointments")
      .select("staff_profile_id, status, price, staff_profiles(profiles(full_name))")
      .eq("status", "completed")
      .gte("starts_at", range.from)
      .lte("starts_at", range.to)
      .not("staff_profile_id", "is", null);
  },

  async getOrderRevenue(range: DateRange) {
    const supabase = getBrowserClient();
    return supabase
      .from("orders")
      .select("total_amount, created_at")
      .not("status", "in", '("cancelled","refunded")')
      .gte("created_at", range.from)
      .lte("created_at", range.to);
  },

  async getProductSales(range: DateRange) {
    const supabase = getBrowserClient();
    return supabase
      .from("order_items")
      .select("quantity, unit_price, product_id, products(name), orders!inner(status, created_at)")
      .eq("orders.status", "delivered")
      .gte("orders.created_at", range.from)
      .lte("orders.created_at", range.to);
  },

  async getDashboardStats(range: DateRange) {
    const supabase = getBrowserClient();

    const [rangeAppointments, pendingCount, totalClients, rangeRevenue, rangeOrders] = await Promise.all([
      supabase
        .from("appointments")
        .select("id, status", { count: "exact" })
        .gte("starts_at", range.from)
        .lte("starts_at", range.to),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer")
        .eq("is_active", true),
      supabase
        .from("appointments")
        .select("price, discount")
        .eq("status", "completed")
        .eq("payment_status", "paid")
        .gte("starts_at", range.from)
        .lte("starts_at", range.to),
      supabase
        .from("orders")
        .select("total_amount")
        .not("status", "in", '("cancelled","refunded")')
        .gte("created_at", range.from)
        .lte("created_at", range.to),
    ]);

    const appointmentRevenue = (rangeRevenue.data ?? []).reduce(
      (sum: number, a) => sum + (a.price - a.discount),
      0,
    );
    const orderRevenue = (rangeOrders.data ?? []).reduce((sum: number, o) => sum + (o.total_amount ?? 0), 0);

    return {
      appointmentsCount: rangeAppointments.count ?? 0,
      pendingAppointmentsCount: pendingCount.count ?? 0,
      totalClientsCount: totalClients.count ?? 0,
      appointmentRevenue,
      orderRevenue,
      revenue: appointmentRevenue + orderRevenue,
    };
  },
};
