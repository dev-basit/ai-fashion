"use client";

import { useState } from "react";
import { useProductCategories, useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductFormProps } from "@/types/props";
import type { Product, ProductCategory } from "@/types/database";

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [costPrice, setCostPrice] = useState(String(product?.cost_price ?? ""));
  const [stock, setStock] = useState(String(product?.stock_quantity ?? 0));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(product?.low_stock_threshold ?? 5));
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [isForSale, setIsForSale] = useState(product?.is_for_sale ?? true);
  const [error, setError] = useState("");

  const { data: categoriesRaw } = useProductCategories();
  const categories = (categoriesRaw ?? []) as ProductCategory[];
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const saving = createProduct.isPending || updateProduct.isPending;

  const save = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!price || isNaN(Number(price))) {
      setError("Valid price is required");
      return;
    }
    setError("");
    const payload: Partial<Product> = {
      name: name.trim(),
      description: description || null,
      sku: sku || null,
      price: Number(price),
      cost_price: costPrice ? Number(costPrice) : null,
      stock_quantity: Number(stock),
      low_stock_threshold: Number(lowStockThreshold),
      category_id: categoryId || null,
      image_url: imageUrl || null,
      is_for_sale: isForSale,
      is_active: true,
    };

    try {
      if (isEdit) await updateProduct.mutateAsync({ id: product!.id, ...payload });
      else await createProduct.mutateAsync(payload);
      onSuccess();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vitamin C Serum" />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label>Description</Label>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>SKU</Label>
          <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-001" />
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={categoryId}
            items={Object.fromEntries(categories.map((c) => [c.id, c.name]))}
            onValueChange={(v: unknown) => setCategoryId(String(v ?? ""))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Price *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Cost Price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Stock Quantity</Label>
          <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Low Stock Alert at</Label>
          <Input
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label>Image URL</Label>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <Switch checked={isForSale} onCheckedChange={setIsForSale} />
          <Label>Available for customer purchase</Label>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving || !name.trim()}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
