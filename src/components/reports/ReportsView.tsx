"use client";

import { useState, useEffect } from "react";
import { reportsService } from "@/services/reports.service";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";
import { exportCsv } from "@/utils/csv";
import { DollarSign, Calendar, Users, TrendingUp, Download } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import type { ReportsViewProps, StaffPerf } from "@/types/props";

export function ReportsView({ role }: ReportsViewProps) {
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(today), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointmentRevenue: 0,
    orderRevenue: 0,
    revenue: 0,
    appointmentCount: 0,
    clientCount: 0,
    avgRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState<{ date: string; appointments: number; products: number }[]>([]);
  const [appointmentData, setAppointmentData] = useState<{ date: string; count: number }[]>([]);
  const [staffPerf, setStaffPerf] = useState<StaffPerf[]>([]);
  const [productSales, setProductSales] = useState<{ name: string; qty: number; revenue: number }[]>([]);

  const isAdmin = role === "admin";

  const load = async () => {
    setLoading(true);
    const range = { from: `${dateFrom}T00:00:00.000Z`, to: `${dateTo}T23:59:59.999Z` };

    const requests: Promise<unknown>[] = [
      reportsService.getRevenueStats(range),
      reportsService.getAppointmentStats(range),
      reportsService.getClientStats(range),
      reportsService.getOrderRevenue(range),
    ];
    if (isAdmin) {
      requests.push(reportsService.getStaffPerformance(range));
      requests.push(reportsService.getProductSales(range));
    }

    const [revenueResult, appointmentResult, clientResult, orderRevenueResult, staffResult, productResult] =
      (await Promise.all(requests)) as [
        Awaited<ReturnType<typeof reportsService.getRevenueStats>>,
        Awaited<ReturnType<typeof reportsService.getAppointmentStats>>,
        Awaited<ReturnType<typeof reportsService.getClientStats>>,
        Awaited<ReturnType<typeof reportsService.getOrderRevenue>>,
        Awaited<ReturnType<typeof reportsService.getStaffPerformance>> | undefined,
        Awaited<ReturnType<typeof reportsService.getProductSales>> | undefined,
      ];

    const revenueRows = (revenueResult.data ?? []) as Array<{ price: number; discount: number; starts_at: string }>;
    const aptRows = (appointmentResult.data ?? []) as Array<{ starts_at: string; status: string }>;
    const clientRows = clientResult.data ?? [];
    const orderRows = (orderRevenueResult.data ?? []) as Array<{ total_amount: number; created_at: string }>;

    const appointmentRevenue = revenueRows.reduce(
      (sum: number, r) => sum + (r.price - r.discount),
      0,
    );
    const orderRevenue = orderRows.reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
    const totalRevenue = appointmentRevenue + orderRevenue;

    // Build merged chart data keyed by date
    const revenueByDate = new Map<string, { appointments: number; products: number }>();
    revenueRows.forEach((r) => {
      const d = formatDate(r.starts_at, "MMM d");
      const existing = revenueByDate.get(d) ?? { appointments: 0, products: 0 };
      revenueByDate.set(d, {
        ...existing,
        appointments: existing.appointments + (r.price - r.discount),
      });
    });
    orderRows.forEach((o) => {
      const d = formatDate(o.created_at, "MMM d");
      const existing = revenueByDate.get(d) ?? { appointments: 0, products: 0 };
      revenueByDate.set(d, { ...existing, products: existing.products + (o.total_amount ?? 0) });
    });

    const aptByDate = new Map<string, number>();
    aptRows.forEach((r) => {
      const d = formatDate(r.starts_at, "MMM d");
      aptByDate.set(d, (aptByDate.get(d) ?? 0) + 1);
    });

    setStats({
      appointmentRevenue,
      orderRevenue,
      revenue: totalRevenue,
      appointmentCount: aptRows.length,
      clientCount: clientRows.length,
      avgRevenue: aptRows.length > 0 ? appointmentRevenue / aptRows.length : 0,
    });
    setRevenueData(
      Array.from(revenueByDate.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, v]) => ({ date, ...v })),
    );
    setAppointmentData(Array.from(aptByDate.entries()).map(([date, count]) => ({ date, count })));

    if (staffResult) {
      const staffRows = (staffResult.data ?? []) as Array<{
        staff_profile_id: string | null;
        price: number;
        staff_profiles?: { profiles?: { full_name?: string | null } | null };
      }>;
      const staffMap = new Map<string, StaffPerf>();
      staffRows.forEach((r) => {
        const name = r.staff_profiles?.profiles?.full_name ?? "Unknown";
        const existing = staffMap.get(name) ?? { name, appointments: 0, revenue: 0 };
        staffMap.set(name, {
          name,
          appointments: existing.appointments + 1,
          revenue: existing.revenue + r.price,
        });
      });
      setStaffPerf(Array.from(staffMap.values()));
    }

    if (productResult) {
      const productRows = (productResult.data ?? []) as Array<{
        quantity: number;
        unit_price: number;
        products?: { name?: string | null };
      }>;
      const productMap = new Map<string, { qty: number; revenue: number }>();
      productRows.forEach((r) => {
        const name = r.products?.name ?? "Unknown";
        const existing = productMap.get(name) ?? { qty: 0, revenue: 0 };
        productMap.set(name, {
          qty: existing.qty + r.quantity,
          revenue: existing.revenue + r.quantity * r.unit_price,
        });
      });
      setProductSales(Array.from(productMap.entries()).map(([name, v]) => ({ name, ...v })));
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="Business performance overview" />

      <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border border-border bg-card">
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From date" className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <DatePicker value={dateTo} onChange={setDateTo} placeholder="To date" className="h-8 text-xs" />
        </div>
        <Button size="sm" onClick={load}>
          Apply
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            exportCsv(
              "revenue-report",
              revenueData.map((r) => ({
                Date: r.date,
                "Appointment Revenue": r.appointments,
                "Product Revenue": r.products,
                "Total Revenue": r.appointments + r.products,
              })),
            )
          }
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="sm:col-span-1">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="font-bold text-base">{formatCurrency(stats.revenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Appointments</span>
                <span className="text-sm font-medium">{formatCurrency(stats.appointmentRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Products</span>
                <span className="text-sm font-medium">{formatCurrency(stats.orderRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sm:col-span-3 grid gap-4 sm:grid-cols-3">
          <StatsCard title="Total Appointments" value={stats.appointmentCount} icon={Calendar} />
          <StatsCard title="New Clients" value={stats.clientCount} icon={Users} />
          <StatsCard title="Avg. Revenue / Appt" value={formatCurrency(stats.avgRevenue)} icon={TrendingUp} />
        </div>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          {isAdmin && <TabsTrigger value="staff">Staff</TabsTrigger>}
          {isAdmin && <TabsTrigger value="products">Products</TabsTrigger>}
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Revenue Over Time</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => exportCsv("revenue", revenueData)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {revenueData.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No data for selected period</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="appointments"
                      name="Appointments"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary)/0.15)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="products"
                      name="Products"
                      stroke="hsl(var(--primary)/0.5)"
                      fill="hsl(var(--primary)/0.05)"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Appointments Over Time</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => exportCsv("appointments", appointmentData)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {appointmentData.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No data for selected period</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={appointmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="staff" className="mt-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Staff Performance</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    exportCsv(
                      "staff-performance",
                      staffPerf.map((s) => ({
                        Name: s.name,
                        Appointments: s.appointments,
                        Revenue: s.revenue,
                      })),
                    )
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                {staffPerf.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No completed appointments for selected period
                  </p>
                ) : (
                  <div className="space-y-3">
                    {staffPerf
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div>
                            <p className="font-medium text-sm">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.appointments} appointments</p>
                          </div>
                          <span className="font-bold">{formatCurrency(s.revenue)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Product Sales</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    exportCsv(
                      "product-sales",
                      productSales.map((p) => ({ Product: p.name, "Units Sold": p.qty, Revenue: p.revenue })),
                    )
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                {productSales.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No product sales for selected period
                  </p>
                ) : (
                  <div className="space-y-3">
                    {productSales
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div>
                            <p className="font-medium text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.qty} units sold</p>
                          </div>
                          <span className="font-bold">{formatCurrency(p.revenue)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
