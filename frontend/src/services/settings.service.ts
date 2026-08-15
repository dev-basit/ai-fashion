import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";

export const settingsService = {
  async get(key: string) {
    try {
      const res = await http.get(API_ROUTES.settings, { params: { key } });
      const items = res.data.data;
      return responseData(Array.isArray(items) ? (items[0] ?? null) : items);
    } catch (e) {
      return responseError(e);
    }
  },

  async getAll() {
    try {
      const res = await http.get(API_ROUTES.settings);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async update(key: string, value: Record<string, unknown>) {
    try {
      const res = await http.patch(API_ROUTES.settings, { key, value });
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },
};
