import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";

export const notificationsService = {
  async getAll(_profileId: string) {
    try {
      const res = await http.get(API_ROUTES.notifications);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getUnreadCount(_profileId: string) {
    try {
      const res = await http.get(API_ROUTES.notificationsUnreadCount);
      return responseData(res.data.data?.count ?? 0);
    } catch (e) {
      return responseError(e);
    }
  },

  async markAsRead(id: string) {
    try {
      const res = await http.post(API_ROUTES.notificationRead(id));
      return responseData(res.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async markAllAsRead(_profileId: string) {
    try {
      const res = await http.post(API_ROUTES.notificationsReadAll);
      return responseData(res.data);
    } catch (e) {
      return responseError(e);
    }
  },
};
