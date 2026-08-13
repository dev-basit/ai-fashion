import { getBrowserClient } from "./supabase";
import type { Order, OrderItem, OrderStatus } from "@/types/database";

export const ordersService = {
  async getAll(clientId?: string) {
    const supabase = getBrowserClient();
    let query = supabase
      .from("orders")
      .select("*, profiles!client_id(id, full_name), order_items(*, products(name, image_url))")
      .order("created_at", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);
    return query;
  },

  async getById(id: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("orders")
      .select("*, profiles!client_id(id, full_name, phone), order_items(*, products(*))")
      .eq("id", id)
      .single();
  },

  async create(payload: {
    client_id: string;
    items: Array<{ product_id: string; quantity: number; unit_price: number }>;
    notes?: string;
  }) {
    const supabase = getBrowserClient();
    const total = payload.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ client_id: payload.client_id, total_amount: total, notes: payload.notes })
      .select()
      .single();

    if (error || !order) return { data: null, error };

    const items = payload.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemsError } = await supabase.from("order_items").insert(items as any);
    return { data: order, error: itemsError };
  },

  async updateStatus(id: string, status: OrderStatus) {
    const supabase = getBrowserClient();
    return supabase.from("orders").update({ status }).eq("id", id).select().single();
  },
};
