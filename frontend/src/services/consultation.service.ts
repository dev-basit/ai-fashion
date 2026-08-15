import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { ConsultationFormTemplate, ConsultationRecord } from "@/types/database";

export const consultationService = {
  async getTemplates() {
    try {
      const res = await http.get(API_ROUTES.consultationTemplates);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getTemplateById(id: string) {
    try {
      const res = await http.get(API_ROUTES.consultationTemplateById(id));
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async createTemplate(payload: Partial<ConsultationFormTemplate>) {
    try {
      const res = await http.post(API_ROUTES.consultationTemplates, payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async updateTemplate(id: string, payload: Partial<ConsultationFormTemplate>) {
    try {
      const res = await http.patch(API_ROUTES.consultationTemplateById(id), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getAllRecords(filters?: { clientId?: string; staffProfileId?: string }) {
    try {
      const res = await http.get(API_ROUTES.consultationRecords, {
        params: {
          clientId: filters?.clientId,
          staffProfileId: filters?.staffProfileId,
        },
      });
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getRecordById(id: string) {
    try {
      const res = await http.get(API_ROUTES.consultationRecordById(id));
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async createRecord(payload: Partial<ConsultationRecord>) {
    try {
      const res = await http.post(API_ROUTES.consultationRecords, payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async updateRecord(id: string, payload: Partial<ConsultationRecord>) {
    try {
      const res = await http.patch(API_ROUTES.consultationRecordById(id), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },
};
