import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

export const ordersService = {
  async getAll(clientId?: string) {
    try {
      const res = await http.get(API_ROUTES.orders, { params: clientId ? { clientId } : undefined });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getById(id: string) {
    try {
      const res = await http.get(API_ROUTES.orderById(id));
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async create(payload: {
    client_id: string;
    items: Array<{ product_id: string; quantity: number; unit_price: number }>;
    notes?: string;
  }) {
    try {
      const res = await http.post(API_ROUTES.orders, payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async updateStatus(id: string, status: OrderStatus) {
    try {
      const res = await http.patch(API_ROUTES.orderById(id), { status });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },
};
