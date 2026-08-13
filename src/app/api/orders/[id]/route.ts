import { NextResponse } from "next/server";
import { withAuth, withAdmin } from "@/lib/api-handlers";
import { notifyUserAndAdmins } from "@/lib/notify";

export const GET = withAuth(async (_request, { supabase }, { params }) => {
  const { id } = await params;
  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles!client_id(id, full_name, phone), order_items(*, products(*))")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
});

export const PATCH = withAdmin(async (request, { supabase }, { params }) => {
  const { id } = await params;
  const body = await request.json();

  const { data: existing } = await supabase.from("orders").select("status, client_id").eq("id", id).single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from("orders").update(body as any).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.status === "delivered" && existing?.status !== "delivered" && existing?.client_id) {
    await notifyUserAndAdmins(existing.client_id, {
      type: "order",
      title: "Order delivered",
      body: "Your order has been marked as delivered. Enjoy your products!",
      data: { order_id: id },
    });
  }

  return NextResponse.json({ data });
});
