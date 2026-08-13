import { getBrowserClient } from "./supabase";
import type { Service, ServiceCategory, ServiceVariant } from "@/types/database";

export const servicesService = {
  async getAllServices(categoryId?: string) {
    const supabase = getBrowserClient();
    let query = supabase
      .from("services")
      .select("*, service_categories(id, name), service_variants(*)")
      .order("sort_order", { ascending: true });
    if (categoryId) query = query.eq("category_id", categoryId);
    return query;
  },

  async getServiceById(id: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("services")
      .select("*, service_categories(id, name), service_variants(*)")
      .eq("id", id)
      .single();
  },

  async createService(payload: Partial<Service>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("services")
      .insert(payload as any)
      .select()
      .single();
  },

  async updateService(id: string, payload: Partial<Service>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("services")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
  },

  async deleteService(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("services").update({ is_active: false }).eq("id", id);
  },

  async getAllCategories() {
    const supabase = getBrowserClient();
    return supabase.from("service_categories").select("*").order("sort_order", { ascending: true });
  },

  async createCategory(payload: Partial<ServiceCategory>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("service_categories")
      .insert(payload as any)
      .select()
      .single();
  },

  async updateCategory(id: string, payload: Partial<ServiceCategory>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("service_categories")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
  },

  async deleteCategory(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("service_categories").update({ is_active: false }).eq("id", id);
  },

  async createVariant(payload: Partial<ServiceVariant>) {
    const supabase = getBrowserClient();
    return supabase
      .from("service_variants")
      .insert(payload as ServiceVariant)
      .select()
      .single();
  },

  async updateVariant(id: string, payload: Partial<ServiceVariant>) {
    const supabase = getBrowserClient();
    return supabase.from("service_variants").update(payload).eq("id", id).select().single();
  },

  async deleteVariant(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("service_variants").delete().eq("id", id);
  },

  async getVariants(serviceId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("service_variants")
      .select("*")
      .eq("service_id", serviceId)
      .order("created_at", { ascending: true });
  },
};
