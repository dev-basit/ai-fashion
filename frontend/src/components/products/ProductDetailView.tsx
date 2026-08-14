"use client";

import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/constants";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { CartSheet } from "./CartSheet";
import { formatCurrency } from "@/utils/format";
import type { ProductDetailViewProps } from "@/types/props";
import type { Product } from "@/types/database";

export function ProductDetailView({ product, role }: ProductDetailViewProps) {
  const { addItem, openCart } = useCartStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.products} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">{product.name}</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="aspect-square rounded-xl bg-muted overflow-hidden flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Package className="h-16 w-16 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-4">
          {(product as Product & { product_categories?: { name: string } }).product_categories && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {(product as Product & { product_categories?: { name: string } }).product_categories?.name}
            </p>
          )}
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

          <p className="text-3xl font-bold">{formatCurrency(product.price)}</p>

          {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}

          {role === "customer" && product.is_for_sale && product.is_active && (
            <Button
              className="w-full"
              onClick={() => {
                addItem(product);
                openCart();
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          )}

          {role !== "customer" && (
            <p className="text-sm text-muted-foreground">
              Stock:{" "}
              <span
                className={
                  product.stock_quantity <= product.low_stock_threshold
                    ? "text-yellow-600 font-medium"
                    : "font-medium"
                }
              >
                {product.stock_quantity}
              </span>
            </p>
          )}
        </div>
      </div>

      {role === "customer" && <CartSheet onCheckout={() => {}} />}
    </div>
  );
}
