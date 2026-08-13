import { NextResponse } from "next/server";
import { getServerClient } from "@/services/supabase-server";

export async function GET() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const [todayCount, pendingCount, revenueResult] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", start)
      .lte("starts_at", end),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("appointments")
      .select("price, discount")
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .gte("starts_at", start)
      .lte("starts_at", end),
  ]);

  const revenue = (revenueResult.data ?? []).reduce(
    (sum, a) => sum + ((a.price as number) - (a.discount as number)),
    0,
  );

  return NextResponse.json({
    data: {
      todayCount: todayCount.count ?? 0,
      pendingCount: pendingCount.count ?? 0,
      todayRevenue: revenue,
    },
  });
}
