import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/database";
import type { Database } from "@/types/supabase";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];

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
    try {
      const res = await http.get(API_ROUTES.appointments, {
        params: {
          clientId: filters?.clientId,
          staffProfileId: filters?.staffProfileId,
          serviceId: filters?.serviceId,
          status: filters?.status,
          from: filters?.dateFrom,
          to: filters?.dateTo,
        },
      });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getById(id: string) {
    try {
      const res = await http.get(API_ROUTES.appointmentById(id));
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async create(payload: Partial<Appointment>) {
    try {
      const res = await http.post(API_ROUTES.appointments, payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async update(id: string, payload: Partial<Appointment>) {
    try {
      const res = await http.patch(API_ROUTES.appointmentById(id), payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async updateStatus(id: string, status: AppointmentStatus) {
    try {
      const res = await http.patch(API_ROUTES.appointmentById(id), { status });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async updatePaymentStatus(
    id: string,
    payment_status: Database["public"]["Tables"]["appointments"]["Row"]["payment_status"],
  ) {
    try {
      const res = await http.patch(API_ROUTES.appointmentById(id), { payment_status });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getProductsUsed(appointmentId: string) {
    try {
      const res = await http.get(API_ROUTES.appointmentProducts(appointmentId));
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async addProductUsed(payload: { appointment_id: string; product_id: string; quantity: number; notes?: string }) {
    try {
      const res = await http.post(API_ROUTES.appointmentProducts(payload.appointment_id), payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async removeProductUsed(id: string) {
    try {
      const res = await http.delete(API_ROUTES.appointmentProductById(id));
      return responseData(res.data);
    } catch (e) { return responseError(e); }
  },

  async delete(id: string) {
    try {
      const res = await http.delete(API_ROUTES.appointmentById(id));
      return responseData(res.data);
    } catch (e) { return responseError(e); }
  },

  async getTodaysAppointments() {
    const today = new Date();
    const from = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const to = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    try {
      const res = await http.get(API_ROUTES.appointments, { params: { from, to } });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },
};
