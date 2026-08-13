import { getBrowserClient } from "./supabase";
import type { Product, ProductCategory } from "@/types/database";

export const productsService = {
  async getAll(filters?: { categoryId?: string; search?: string }) {
    const supabase = getBrowserClient();
    let query = supabase
      .from("products")
      .select("*, product_categories(id, name)")
      .order("name", { ascending: true });

    if (filters?.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
    return query;
  },

  async getById(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("products").select("*, product_categories(*)").eq("id", id).single();
  },

  async create(payload: Partial<Product>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("products")
      .insert(payload as any)
      .select()
      .single();
  },

  async update(id: string, payload: Partial<Product>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("products")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
  },

  async delete(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("products").update({ is_active: false }).eq("id", id);
  },

  async updateStock(id: string, quantity: number) {
    const supabase = getBrowserClient();
    return supabase.from("products").update({ stock_quantity: quantity }).eq("id", id).select().single();
  },

  async getAllCategories() {
    const supabase = getBrowserClient();
    return supabase
      .from("product_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
  },

  async createCategory(payload: Partial<ProductCategory>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("product_categories")
      .insert(payload as any)
      .select()
      .single();
  },

  async getLowStockProducts() {
    const supabase = getBrowserClient();
    return supabase
      .from("products")
      .select("*")
      .filter("stock_quantity", "lte", "low_stock_threshold")
      .eq("is_active", true);
  },
};
