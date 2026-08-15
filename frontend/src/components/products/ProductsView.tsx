"use client";

import { useState } from "react";
import { Plus, ShoppingBag, Search, ShoppingCart, Pencil, Trash2, MoreVertical, Package } from "lucide-react";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cart.store";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PageLoading } from "@/components/common/LoadingSpinner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductForm } from "./ProductForm";
import { ProductInventory } from "./ProductInventory";
import { CartSheet } from "./CartSheet";
import { Checkout } from "./Checkout";
import { OrderList } from "./OrderList";
import { formatCurrency } from "@/utils/format";
import type { ProductsViewProps } from "@/types/props";
import type { Product } from "@/types/database";

export function ProductsView({ role, userId }: ProductsViewProps) {
  const [search, setSearch] = useState("");
  const { data: productsRaw, isLoading } = useProducts({ search: search || undefined });
  const products = (productsRaw ?? []) as Product[];
  const { addItem, items, openCart } = useCartStore();
  const isAdmin = role === "admin";

  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const deleteProductMutation = useDeleteProduct();

  const cartCount = items.reduce((n, i) => n + i.quantity, 0);

  const handleDelete = () => {
    if (!deleteProduct) return;
    deleteProductMutation.mutate(deleteProduct.id, { onSuccess: () => setDeleteProduct(null) });
  };

  const lowStock = products.filter((p) => p.stock_quantity <= p.low_stock_threshold);

  if (isLoading) return <PageLoading />;

  if (showCheckout) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <Checkout userId={userId} onDone={() => setShowCheckout(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={role === "customer" ? "Browse and purchase products" : "Manage your product catalog"}
        action={
          <div className="flex items-center gap-2">
            {role === "customer" && (
              <Button variant="outline" size="sm" onClick={openCart} className="relative">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => {
                  setEditProduct(null);
                  setShowProductForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            )}
          </div>
        }
      />

      {isAdmin && lowStock.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 p-4">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            {lowStock.length} product{lowStock.length > 1 ? "s" : ""} low on stock
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
            {lowStock.map((p) => p.name).join(", ")}
          </p>
        </div>
      )}

      {isAdmin ? (
        <Tabs defaultValue="catalog">
          <TabsList>
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {products.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="h-12 w-12" />}
                title="No products found"
                description="Create your first product."
                action={
                  <Button size="sm" onClick={() => setShowProductForm(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <Card key={product.id} className={!product.is_active ? "opacity-50" : ""}>
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden flex items-center justify-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          {product.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditProduct(product);
                                  setShowProductForm(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteProduct(product)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Disable
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-sm">{formatCurrency(product.price)}</span>
                        <span
                          className={`text-xs ${product.stock_quantity <= product.low_stock_threshold ? "text-yellow-600 font-medium" : "text-muted-foreground"}`}
                        >
                          {product.stock_quantity} in stock
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="mt-4">
            <ProductInventory products={products} onRefetch={() => {}} />
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <OrderList role={role} userId={userId} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {role === "customer" ? (
            <Tabs defaultValue="shop">
              <TabsList>
                <TabsTrigger value="shop">Shop</TabsTrigger>
                <TabsTrigger value="orders">My Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="shop" className="mt-4">
                {products.filter((p) => p.is_active && p.is_for_sale).length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag className="h-12 w-12" />}
                    title="No products available"
                    description="Check back later for new products."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products
                      .filter((p) => p.is_active && p.is_for_sale)
                      .map((product) => (
                        <Card key={product.id}>
                          <CardContent className="p-4">
                            <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden flex items-center justify-center">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <h3 className="font-medium text-sm">{product.name}</h3>
                            {product.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <span className="font-bold">{formatCurrency(product.price)}</span>
                              <Button
                                size="sm"
                                onClick={() => {
                                  addItem(product);
                                  openCart();
                                }}
                              >
                                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                <OrderList role={role} userId={userId} />
              </TabsContent>
            </Tabs>
          ) : /* Staff: browse-only, no cart, no orders */
          products.filter((p) => p.is_active && p.is_for_sale).length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-12 w-12" />}
              title="No products available"
              description="No products are currently listed."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products
                .filter((p) => p.is_active && p.is_for_sale)
                .map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden flex items-center justify-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                      )}
                      <div className="mt-3">
                        <span className="font-bold">{formatCurrency(product.price)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Cart sheet (customer) */}
      {role === "customer" && <CartSheet onCheckout={() => setShowCheckout(true)} />}

      {/* Product form dialog (admin) */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editProduct ?? undefined}
            onSuccess={() => setShowProductForm(false)}
            onCancel={() => setShowProductForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm (admin) */}
      <ConfirmDialog
        open={!!deleteProduct}
        onOpenChange={(o) => {
          if (!o) setDeleteProduct(null);
        }}
        title={`Disable "${deleteProduct?.name}"?`}
        description="This product will be hidden from the catalog. Stock data is preserved."
        onConfirm={handleDelete}
        loading={deleteProductMutation.isPending}
        destructive
      />
    </div>
  );
}
