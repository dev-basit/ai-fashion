import { getBrowserClient } from "./supabase";
import type { AppointmentStatus } from "@/types/database";
import type { Database } from "@/types/supabase";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];

const APPOINTMENT_SELECT = `
  *,
  services(id, name, duration_mins, base_price),
  profiles!client_id(id, full_name, avatar_url, phone),
  staff_profiles(id, profiles(id, full_name, avatar_url))
`;

export interface AppointmentFilters {
  clientId?: string;
  staffProfileId?: string;
  serviceId?: string;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
}

export const appointmentsService = {
  async getAll(filters?: AppointmentFilters) {
    const supabase = getBrowserClient();
    let query = supabase.from("appointments").select(APPOINTMENT_SELECT).order("starts_at", { ascending: false });

    if (filters?.clientId) query = query.eq("client_id", filters.clientId);
    if (filters?.staffProfileId) query = query.eq("staff_profile_id", filters.staffProfileId);
    if (filters?.serviceId) query = query.eq("service_id", filters.serviceId);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.dateFrom) query = query.gte("starts_at", filters.dateFrom);
    if (filters?.dateTo) query = query.lte("starts_at", filters.dateTo);

    return query;
  },

  async getById(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("appointments").select(APPOINTMENT_SELECT).eq("id", id).single();
  },

  async create(payload: Partial<Appointment>) {
    const supabase = getBrowserClient();
    return supabase
      .from("appointments")
      .insert(payload as Appointment)
      .select(APPOINTMENT_SELECT)
      .single();
  },

  async update(id: string, payload: Partial<Appointment>) {
    const supabase = getBrowserClient();
    return supabase.from("appointments").update(payload).eq("id", id).select(APPOINTMENT_SELECT).single();
  },

  async updateStatus(id: string, status: AppointmentStatus) {
    const supabase = getBrowserClient();
    return supabase.from("appointments").update({ status }).eq("id", id).select().single();
  },

  async updatePaymentStatus(
    id: string,
    payment_status: Database["public"]["Tables"]["appointments"]["Row"]["payment_status"],
  ) {
    const supabase = getBrowserClient();
    return supabase.from("appointments").update({ payment_status }).eq("id", id).select().single();
  },

  async getProductsUsed(appointmentId: string) {
    const supabase = getBrowserClient();
    return supabase
      .from("appointment_products")
      .select("*, products(id, name, stock_quantity)")
      .eq("appointment_id", appointmentId);
  },

  async addProductUsed(payload: { appointment_id: string; product_id: string; quantity: number; notes?: string }) {
    const supabase = getBrowserClient();
    return supabase.from("appointment_products").insert(payload).select("*, products(name)").single();
  },

  async removeProductUsed(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("appointment_products").delete().eq("id", id);
  },

  async delete(id: string) {
    const supabase = getBrowserClient();
    return supabase.from("appointments").delete().eq("id", id);
  },

  async getTodaysAppointments() {
    const supabase = getBrowserClient();
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    return supabase
      .from("appointments")
      .select(APPOINTMENT_SELECT)
      .gte("starts_at", start)
      .lte("starts_at", end)
      .order("starts_at", { ascending: true });
  },
};
