"use client";

import { Package } from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";
import { ORDER_STATUS_CLASSES } from "@/config/colors";
import { ORDER_STATUS_LABELS } from "@/config/constants";
import type { OrderListProps } from "@/types/props";
import type { Order, OrderStatus } from "@/types/database";

export function OrderList({ role, userId }: OrderListProps) {
  const isAdmin = role === "admin";
  const clientId = isAdmin ? undefined : userId;
  const { data: ordersRaw, isLoading } = useOrders(clientId ? { clientId } : undefined);
  const orders = (ordersRaw ?? []) as Order[];
  const updateOrderStatus = useUpdateOrderStatus();

  if (isLoading) return <PageLoading />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No orders"
        description="Orders will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const ext = order as Order & {
          profiles?: { full_name?: string };
          order_items?: Array<{ products?: { name?: string }; quantity: number; unit_price: number }>;
        };
        return (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASSES[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  {isAdmin && ext.profiles?.full_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{ext.profiles.full_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  {ext.order_items && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {ext.order_items.map((i) => `${i.products?.name ?? "Product"} ×${i.quantity}`).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold">{formatCurrency(order.total_amount)}</span>
                  {isAdmin && (
                    <Select
                      value={order.status}
                      items={ORDER_STATUS_LABELS}
                      onValueChange={(v: unknown) =>
                        updateOrderStatus.mutate({ id: order.id, status: String(v) as OrderStatus })
                      }
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
