import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { Profile } from "@/types/database";

export const clientsService = {
  async getAll(search?: string) {
    try {
      const res = await http.get(API_ROUTES.clients, { params: search ? { search } : undefined });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getById(id: string) {
    try {
      const res = await http.get(API_ROUTES.clientById(id));
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async create(payload: Partial<Profile>) {
    try {
      const res = await http.post(API_ROUTES.clients, payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async update(id: string, payload: Partial<Profile>) {
    try {
      const res = await http.patch(API_ROUTES.clientById(id), payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async deactivate(id: string) {
    try {
      const res = await http.delete(API_ROUTES.clientById(id));
      return responseData(res.data);
    } catch (e) { return responseError(e); }
  },

  async getAppointmentCountsByClient(): Promise<{ data: Record<string, number> | null; error: { message: string } | null }> {
    try {
      const res = await http.get(API_ROUTES.clientAppointmentCounts);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getClientHistory(clientId: string) {
    try {
      const res = await http.get(API_ROUTES.clientHistory(clientId));
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },
};
