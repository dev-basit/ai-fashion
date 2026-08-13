"use client";

import type { CheckoutProps } from "@/types/props";

import { useState } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/format";

export function Checkout({ userId, onDone }: CheckoutProps) {
  const { items, total, clearCart } = useCartStore();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");

  const placeOrder = async () => {
    setSaving(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: userId,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          unit_price: i.product.price,
        })),
        notes: notes || undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) return;
    const { data } = await res.json();
    if (!data) return;
    clearCart();
    setOrderId(data.id);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h2 className="text-xl font-bold">Order Placed!</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your order has been received and is being processed. Order ID:{" "}
          <span className="font-mono">{orderId.slice(0, 8)}...</span>
        </p>
        <Button onClick={onDone}>Continue Shopping</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
        <Button variant="outline" onClick={onDone}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Checkout</h2>

      <Card>
        <CardContent className="p-4 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm">
              <span>
                {product.name} × {quantity}
              </span>
              <span className="font-medium">{formatCurrency(product.price * quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total())}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        <Label>Order Notes (optional)</Label>
        <Textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onDone} className="flex-1">
          Back
        </Button>
        <Button onClick={placeOrder} disabled={saving} className="flex-1">
          {saving ? "Placing Order..." : "Confirm Order"}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">Payment is collected in-store. No card required.</p>
    </div>
  );
}
