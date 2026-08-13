import { getBrowserClient } from "./supabase";
import type { Profile } from "@/types/database";

export const clientsService = {
  async getAll(search?: string) {
    const supabase = getBrowserClient();
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .eq("is_active", true)
      .order("full_name", { ascending: true });

    if (search) query = query.ilike("full_name", `%${search}%`);
    return query;
  },

  async getById(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("profiles").select("*").eq("id", id).single();
  },

  async create(payload: Partial<Profile>) {
    const supabase = getBrowserClient();
    return supabase
      .from("profiles")
      .insert({ ...payload, role: "customer" } as Profile)
      .select()
      .single();
  },

  async update(id: string, payload: Partial<Profile>) {
    const supabase = getBrowserClient();
    return supabase.from("profiles").update(payload).eq("id", id).select().single();
  },

  async deactivate(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("profiles").update({ is_active: false }).eq("id", id);
  },

  async getAppointmentCountsByClient() {
    const supabase = getBrowserClient();
    const { data } = await supabase.from("appointments").select("client_id");
    const counts: Record<string, number> = {};
    (data ?? []).forEach((row) => {
      const id = (row as { client_id: string }).client_id;
      counts[id] = (counts[id] ?? 0) + 1;
    });
    return counts;
  },

  async getClientHistory(clientId: string) {
    const supabase = getBrowserClient();
    const [appointments, orders, consultations, plans] = await Promise.all([
      supabase
        .from("appointments")
        .select("*, services(name, base_price), staff_profiles(profiles(full_name))")
        .eq("client_id", clientId)
        .order("starts_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*, order_items(*, products(name))")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("consultation_records")
        .select("*, consultation_form_templates(name), staff_profiles(profiles(full_name))")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_treatment_plans")
        .select("*, treatment_plan_templates(name)")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    ]);
    return {
      appointments: appointments.data,
      orders: orders.data,
      consultations: consultations.data,
      plans: plans.data,
    };
  },
};
