import { getBrowserClient } from "./supabase";
import type { StaffProfile, StaffSchedule } from "@/types/database";

export const staffService = {
  async getAll() {
    const supabase = getBrowserClient();
    return supabase
      .from("staff_profiles")
      .select("*, profiles(id, full_name, phone, avatar_url, is_active)")
      .order("created_at", { ascending: false });
  },

  async getById(id: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("staff_profiles")
      .select("*, profiles(*), staff_services(services(*))")
      .eq("id", id)
      .single();
  },

  async getByProfileId(profileId: string) {
    const supabase = getBrowserClient();
    return supabase.from("staff_profiles").select("*, profiles(*)").eq("profile_id", profileId).single();
  },

  async create(payload: Partial<StaffProfile>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("staff_profiles")
      .insert(payload as any)
      .select()
      .single();
  },

  async update(id: string, payload: Partial<StaffProfile>) {
    const supabase = getBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase
      .from("staff_profiles")
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();
  },

  async setAvailability(id: string, isAvailable: boolean) {
    const supabase = getBrowserClient();
    return supabase.from("staff_profiles").update({ is_available: isAvailable }).eq("id", id).select().single();
  },

  async deactivateProfile(profileId: string) {
    const supabase = getBrowserClient();
    return supabase.from("profiles").update({ is_active: false }).eq("id", profileId);
  },

  async getSchedule(staffProfileId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("staff_schedules")
      .select("*")
      .eq("staff_profile_id", staffProfileId)
      .order("day_of_week", { ascending: true });
  },

  async upsertSchedule(schedules: Partial<StaffSchedule>[]) {
    const supabase = getBrowserClient();
    return supabase
      .from("staff_schedules")
      .upsert(schedules as StaffSchedule[], { onConflict: "staff_profile_id,day_of_week" });
  },

  async getLeaves(staffProfileId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("staff_leaves")
      .select("*")
      .eq("staff_profile_id", staffProfileId)
      .order("starts_at", { ascending: true });
  },

  async createLeave(payload: { staff_profile_id: string; starts_at: string; ends_at: string; reason?: string }) {
    const supabase = getBrowserClient();
    return supabase.from("staff_leaves").insert(payload).select().single();
  },

  async assignService(staffProfileId: string, serviceId: string) {
    const supabase = getBrowserClient();
    return supabase.from("staff_services").insert({ staff_profile_id: staffProfileId, service_id: serviceId });
  },

  async removeService(staffProfileId: string, serviceId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("staff_services")
      .delete()
      .eq("staff_profile_id", staffProfileId)
      .eq("service_id", serviceId);
  },
};
