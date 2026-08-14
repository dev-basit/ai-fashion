import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { TreatmentPlanTemplate, ClientTreatmentPlan } from "@/types/database";

export const treatmentPlansService = {
  async getTemplates() {
    try {
      const res = await http.get(API_ROUTES.treatmentPlanTemplates);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getTemplateById(id: string) {
    try {
      const res = await http.get(API_ROUTES.treatmentPlanTemplateById(id));
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async createTemplate(payload: Partial<TreatmentPlanTemplate>) {
    try {
      const res = await http.post(API_ROUTES.treatmentPlanTemplates, payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async updateTemplate(id: string, payload: Partial<TreatmentPlanTemplate>) {
    try {
      const res = await http.patch(API_ROUTES.treatmentPlanTemplateById(id), payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getClientPlans(filters?: { clientId?: string }) {
    try {
      const res = await http.get(API_ROUTES.treatmentPlans, {
        params: filters?.clientId ? { clientId: filters.clientId } : undefined,
      });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getClientPlanById(id: string) {
    try {
      const res = await http.get(API_ROUTES.treatmentPlanById(id));
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async createClientPlan(payload: Partial<ClientTreatmentPlan>) {
    try {
      const res = await http.post(API_ROUTES.treatmentPlans, payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async updateClientPlan(id: string, payload: Partial<ClientTreatmentPlan>) {
    try {
      const res = await http.patch(API_ROUTES.treatmentPlanById(id), payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },
};
