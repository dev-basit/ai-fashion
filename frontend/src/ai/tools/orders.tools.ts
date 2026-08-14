import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

function formatOrder(o: Record<string, unknown>) {
  return {
    id: o.id,
    status: o.status,
    total_amount: o.total_amount,
    created_at: o.created_at,
    items: ((o.order_items as Record<string, unknown>[]) ?? []).map((i) => ({
      product: (i.products as Record<string, unknown>)?.name,
      quantity: i.quantity,
      unit_price: i.unit_price,
    })),
  };
}

const getMyOrdersTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/orders`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const orders = json.data ?? [];
    if (!orders.length) return "You have no orders.";
    return JSON.stringify(orders.slice(0, input.limit ?? 10).map(formatOrder), null, 2);
  },
  {
    name: "get_my_orders",
    description: "List the current customer's own orders with item details and status.",
    schema: z.object({
      limit: z.number().optional().describe("Max orders to return (default 10)"),
    }),
  },
);

const getOrderStatusTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/orders/${input.order_id}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Order not found or access denied: ${json.error ?? res.statusText}`;
    return JSON.stringify(formatOrder(json.data as Record<string, unknown>), null, 2);
  },
  {
    name: "get_order_status",
    description: "Get the full details and status of a specific order by its ID.",
    schema: z.object({
      order_id: z.string().describe("UUID of the order"),
    }),
  },
);

const getAllOrdersTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const p = new URLSearchParams();
    if (input.client_id) p.set("clientId", input.client_id);
    const res = await fetch(`${baseUrl}/api/orders?${p}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const orders = json.data ?? [];
    if (!orders.length) return "No orders found.";
    return JSON.stringify(
      orders.map((o: Record<string, unknown>) => ({
        id: o.id,
        client: (o.profiles as Record<string, unknown>)?.full_name,
        status: o.status,
        total_amount: o.total_amount,
        created_at: o.created_at,
      })),
      null,
      2,
    );
  },
  {
    name: "get_all_orders",
    description: "List all orders across all clients. Optionally filter by a specific client.",
    schema: z.object({
      client_id: z.string().optional().describe("Filter by client profile UUID"),
    }),
  },
);

const updateOrderStatusTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/orders/${input.order_id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ status: input.status }),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to update order: ${json.error ?? res.statusText}`;
    return `Order ${input.order_id} status updated to "${input.status}".`;
  },
  {
    name: "update_order_status",
    description:
      "Update the status of an order. Admin only. Valid statuses: pending, processing, shipped, delivered, cancelled.",
    schema: z.object({
      order_id: z.string().describe("UUID of the order"),
      status: z.string().describe("New status: pending | processing | shipped | delivered | cancelled | refunded"),
    }),
  },
);

export const customerOrderTools = [getMyOrdersTool, getOrderStatusTool];
export const staffOrderTools = [getAllOrdersTool, getOrderStatusTool];
export const adminOrderTools = [...staffOrderTools, updateOrderStatusTool];
