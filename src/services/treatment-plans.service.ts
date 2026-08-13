import { getBrowserClient } from "./supabase";
import type { TreatmentPlanTemplate, ClientTreatmentPlan } from "@/types/database";

export const treatmentPlansService = {
  async getTemplates() {
    const supabase = getBrowserClient();
    return supabase
      .from("treatment_plan_templates")
      .select("*")
      .eq("is_active", true)
      .order("duration_days", { ascending: true });
  },

  async getTemplateById(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("treatment_plan_templates").select("*").eq("id", id).single();
  },

  async createTemplate(payload: Partial<TreatmentPlanTemplate>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("treatment_plan_templates")
      .insert(payload as any)
      .select()
      .single();
  },

  async updateTemplate(id: string, payload: Partial<TreatmentPlanTemplate>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("treatment_plan_templates")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
  },

  async getClientPlans(filters?: { clientId?: string }) {
    const supabase = getBrowserClient();
    let query = supabase
      .from("client_treatment_plans")
      .select("*, profiles!client_id(id, full_name, avatar_url), treatment_plan_templates(name, duration_days)")
      .order("created_at", { ascending: false });

    if (filters?.clientId) query = query.eq("client_id", filters.clientId);
    return query;
  },

  async getClientPlanById(id: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("client_treatment_plans")
      .select("*, profiles!client_id(*), treatment_plan_templates(*)")
      .eq("id", id)
      .single();
  },

  async createClientPlan(payload: Partial<ClientTreatmentPlan>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("client_treatment_plans")
      .insert(payload as any)
      .select()
      .single();
  },

  async updateClientPlan(id: string, payload: Partial<ClientTreatmentPlan>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("client_treatment_plans")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
  },
};
