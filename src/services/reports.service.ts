import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";

export interface DateRange {
  from: string;
  to: string;
}

export const reportsService = {
  async getRevenueStats(range: DateRange) {
    try {
      const res = await http.get(API_ROUTES.reports, { params: { type: "revenue", from: range.from, to: range.to } });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getAppointmentStats(range: DateRange) {
    try {
      const res = await http.get(API_ROUTES.reports, { params: { type: "appointments", from: range.from, to: range.to } });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getClientStats(range: DateRange) {
    try {
      const res = await http.get(API_ROUTES.reports, { params: { type: "clients", from: range.from, to: range.to } });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getStaffPerformance(range: DateRange) {
    try {
      const res = await http.get(API_ROUTES.reports, { params: { type: "staff", from: range.from, to: range.to } });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getOrderRevenue(range: DateRange) {
    try {
      const res = await http.get(API_ROUTES.reports, { params: { type: "orders", from: range.from, to: range.to } });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getProductSales(range: DateRange) {
    try {
      const res = await http.get(API_ROUTES.reports, { params: { type: "products", from: range.from, to: range.to } });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getDashboardStats(range: DateRange) {
    try {
      const res = await http.get(API_ROUTES.reports, { params: { type: "dashboard", from: range.from, to: range.to } });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },
};
