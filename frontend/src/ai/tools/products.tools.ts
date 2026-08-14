import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";
import type { RunnableConfig } from "@langchain/core/runnables";
import { toolCtx, authHeaders } from "@/lib/ai";

const listProductsTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const p = new URLSearchParams();
    if (input.search) p.set("search", input.search);
    if (input.category_id) p.set("categoryId", input.category_id);
    const res = await fetch(`${baseUrl}/api/products?${p}`, { headers: authHeaders(accessToken) });
    const json = await res.json();
    if (!res.ok) return `Error: ${json.error ?? res.statusText}`;
    const products = json.data ?? [];
    if (!products.length) return "No products found.";
    return JSON.stringify(
      products.map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name,
        category: (p.product_categories as Record<string, unknown>)?.name,
        price: p.price,
        stock_quantity: p.stock_quantity,
        description: p.description,
      })),
      null,
      2,
    );
  },
  {
    name: "list_products",
    description: "List available products. Optionally search by name or filter by category.",
    schema: z.object({
      search: z.string().optional().describe("Search products by name"),
      category_id: z.string().optional().describe("Filter by product category UUID"),
    }),
  },
);

const createProductTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to create product: ${json.error ?? res.statusText}`;
    return `Product "${input.name}" created successfully.`;
  },
  {
    name: "create_product",
    description: "Create a new product. Admin only. Confirm all details before creating.",
    schema: z.object({
      name: z.string().describe("Product name"),
      description: z.string().optional().describe("Product description"),
      price: z.number().describe("Product price"),
      stock_quantity: z.number().describe("Initial stock quantity"),
      category_id: z.string().optional().describe("UUID of the product category"),
    }),
  },
);

const updateProductTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const { product_id, ...body } = input;
    const res = await fetch(`${baseUrl}/api/products/${product_id}`, {
      method: "PATCH",
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to update product: ${json.error ?? res.statusText}`;
    return `Product ${product_id} updated successfully.`;
  },
  {
    name: "update_product",
    description: "Update an existing product (price, stock, description, etc.). Admin only.",
    schema: z.object({
      product_id: z.string().describe("UUID of the product to update"),
      name: z.string().optional().describe("New name"),
      description: z.string().optional().describe("New description"),
      price: z.number().optional().describe("New price"),
      stock_quantity: z.number().optional().describe("New stock quantity"),
      is_active: z.boolean().optional().describe("Set false to deactivate the product"),
    }),
  },
);

const deleteProductTool = tool(
  async (input, config: RunnableConfig | undefined) => {
    const { accessToken, baseUrl } = toolCtx(config);
    const res = await fetch(`${baseUrl}/api/products/${input.product_id}`, {
      method: "DELETE",
      headers: authHeaders(accessToken),
    });
    const json = await res.json();
    if (!res.ok) return `Failed to delete product: ${json.error ?? res.statusText}`;
    return `Product ${input.product_id} deleted permanently.`;
  },
  {
    name: "delete_product",
    description: "Permanently delete a product. Admin only. Ask for confirmation before proceeding.",
    schema: z.object({
      product_id: z.string().describe("UUID of the product to delete"),
    }),
  },
);

export const sharedProductTools = [listProductsTool];
export const adminProductTools = [...sharedProductTools, createProductTool, updateProductTool, deleteProductTool];
