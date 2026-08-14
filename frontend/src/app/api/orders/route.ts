import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-handlers";
import { getAdminClient } from "@/services/supabase-admin";
import { notifyUserAndAdmins } from "@/lib/notify";

export const GET = withAuth(async (request: NextRequest, { user, supabase }) => {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  let query = supabase
    .from("orders")
    .select("*, profiles!client_id(id, full_name), order_items(*, products(name, image_url))")
    .order("created_at", { ascending: false });

  if (profile?.role === "customer") {
    query = query.eq("client_id", user.id);
  } else if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (request: NextRequest, { supabase }) => {
  const body: {
    client_id: string;
    items: Array<{ product_id: string; quantity: number; unit_price: number }>;
    notes?: string;
  } = await request.json();
  const total = body.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ client_id: body.client_id, total_amount: total, notes: body.notes } as any)
    .select()
    .single();

  if (orderErr || !order) return NextResponse.json({ error: orderErr?.message }, { status: 500 });

  const items = body.items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    quantity: i.quantity,
    unit_price: i.unit_price,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsErr } = await supabase.from("order_items").insert(items as any);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  // Decrement stock using admin client (bypasses RLS — customers cannot update products directly)
  const admin = getAdminClient();
  const productIds = body.items.map((i) => i.product_id);
  const { data: products } = await admin.from("products").select("id, stock_quantity").in("id", productIds);
  if (products) {
    for (const item of body.items) {
      const current = products.find((p) => p.id === item.product_id)?.stock_quantity ?? 0;
      await admin
        .from("products")
        .update({ stock_quantity: Math.max(0, current - item.quantity) })
        .eq("id", item.product_id);
    }
  }

  const itemCount = body.items.reduce((s, i) => s + i.quantity, 0);
  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", body.client_id)
    .single();
  const clientName = clientProfile?.full_name ?? "A client";

  await notifyUserAndAdmins(body.client_id, {
    type: "order",
    title: "Order placed",
    body: `Your order of ${itemCount} item${itemCount !== 1 ? "s" : ""} has been placed successfully.`,
    data: { order_id: order.id },
  });

  await notifyUserAndAdmins(null, {
    type: "order",
    title: "New order received",
    body: `${clientName} placed an order of ${itemCount} item${itemCount !== 1 ? "s" : ""} (£${total.toFixed(2)}).`,
    data: { order_id: order.id },
  });

  return NextResponse.json({ data: order }, { status: 201 });
});
