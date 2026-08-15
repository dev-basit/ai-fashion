import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { Service, ServiceCategory, ServiceVariant } from "@/types/database";

export const servicesService = {
  async getAllServices(categoryId?: string) {
    try {
      const res = await http.get(API_ROUTES.services, { params: categoryId ? { categoryId } : undefined });
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getServiceById(id: string) {
    try {
      const res = await http.get(API_ROUTES.serviceById(id));
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async createService(payload: Partial<Service>) {
    try {
      const res = await http.post(API_ROUTES.services, payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async updateService(id: string, payload: Partial<Service>) {
    try {
      const res = await http.patch(API_ROUTES.serviceById(id), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async deleteService(id: string) {
    try {
      const res = await http.delete(API_ROUTES.serviceById(id));
      return responseData(res.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getAllCategories() {
    try {
      const res = await http.get(API_ROUTES.serviceCategories);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async createCategory(payload: Partial<ServiceCategory>) {
    try {
      const res = await http.post(API_ROUTES.serviceCategories, payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async updateCategory(id: string, payload: Partial<ServiceCategory>) {
    try {
      const res = await http.patch(API_ROUTES.serviceCategoryById(id), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async deleteCategory(id: string) {
    try {
      const res = await http.delete(API_ROUTES.serviceCategoryById(id));
      return responseData(res.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async createVariant(payload: Partial<ServiceVariant>) {
    try {
      const res = await http.post(API_ROUTES.serviceVariants(payload.service_id!), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async updateVariant(id: string, payload: Partial<ServiceVariant>) {
    try {
      const res = await http.patch(API_ROUTES.serviceVariantById(id), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async deleteVariant(id: string) {
    try {
      const res = await http.delete(API_ROUTES.serviceVariantById(id));
      return responseData(res.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getVariants(serviceId: string) {
    try {
      const res = await http.get(API_ROUTES.serviceVariants(serviceId));
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },
};
