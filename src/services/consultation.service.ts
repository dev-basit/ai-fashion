import { getBrowserClient } from "./supabase";
import type { ConsultationFormTemplate, ConsultationRecord } from "@/types/database";

export const consultationService = {
  async getTemplates() {
    const supabase = getBrowserClient();
    return supabase
      .from("consultation_form_templates")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });
  },

  async getTemplateById(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("consultation_form_templates").select("*").eq("id", id).single();
  },

  async createTemplate(payload: Partial<ConsultationFormTemplate>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("consultation_form_templates")
      .insert(payload as any)
      .select()
      .single();
  },

  async updateTemplate(id: string, payload: Partial<ConsultationFormTemplate>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("consultation_form_templates")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
  },

  async getAllRecords(filters?: { clientId?: string; staffProfileId?: string }) {
    const supabase = getBrowserClient();
    let query = supabase
      .from("consultation_records")
      .select(
        "*, profiles!client_id(id, full_name, avatar_url), staff_profiles(profiles(full_name)), consultation_form_templates(name)",
      )
      .order("created_at", { ascending: false });

    if (filters?.clientId) query = query.eq("client_id", filters.clientId);
    if (filters?.staffProfileId) query = query.eq("staff_profile_id", filters.staffProfileId);
    return query;
  },

  async getRecordById(id: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("consultation_records")
      .select("*, profiles!client_id(*), staff_profiles(*, profiles(*)), consultation_form_templates(*)")
      .eq("id", id)
      .single();
  },

  async createRecord(payload: Partial<ConsultationRecord>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("consultation_records")
      .insert(payload as any)
      .select()
      .single();
  },

  async updateRecord(id: string, payload: Partial<ConsultationRecord>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("consultation_records")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
  },
};
