"use client";

import { useState } from "react";
import { productsService } from "@/services/products.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { ProductInventoryProps } from "@/types/props";

export function ProductInventory({ products, onRefetch }: ProductInventoryProps) {
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (productId: string) => {
    const qty = Number(editing[productId]);
    if (isNaN(qty) || qty < 0) return;
    setSaving(productId);
    await productsService.updateStock(productId, qty);
    setSaving(null);
    const updated = { ...editing };
    delete updated[productId];
    setEditing(updated);
    onRefetch();
  };

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead className="text-right">Alert Threshold</TableHead>
            <TableHead className="text-right w-48">Update Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow
              key={p.id}
              className={p.stock_quantity <= p.low_stock_threshold ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""}
            >
              <TableCell>
                <p className="font-medium text-sm">{p.name}</p>
                {p.sku && <p className="text-xs text-muted-foreground">{p.sku}</p>}
              </TableCell>
              <TableCell className="text-right">
                <span className={p.stock_quantity <= p.low_stock_threshold ? "text-yellow-600 font-semibold" : ""}>
                  {p.stock_quantity}
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">{p.low_stock_threshold}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Input
                    type="number"
                    min="0"
                    className="h-8 w-20 text-right"
                    placeholder={String(p.stock_quantity)}
                    value={editing[p.id] ?? ""}
                    onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    className="h-8"
                    disabled={!editing[p.id] || saving === p.id}
                    onClick={() => handleSave(p.id)}
                  >
                    {saving === p.id ? "..." : "Set"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No products
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
