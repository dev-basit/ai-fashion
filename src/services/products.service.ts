import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types/database";

export const productsService = {
  async getAll(filters?: { categoryId?: string; search?: string }) {
    try {
      const res = await http.get(API_ROUTES.products, { params: filters });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getById(id: string) {
    try {
      const res = await http.get(API_ROUTES.productById(id));
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async create(payload: Partial<Product>) {
    try {
      const res = await http.post(API_ROUTES.products, payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async update(id: string, payload: Partial<Product>) {
    try {
      const res = await http.patch(API_ROUTES.productById(id), payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async delete(id: string) {
    try {
      const res = await http.delete(API_ROUTES.productById(id));
      return responseData(res.data);
    } catch (e) { return responseError(e); }
  },

  async updateStock(id: string, quantity: number) {
    try {
      const res = await http.patch(API_ROUTES.productById(id), { stock_quantity: quantity });
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getAllCategories() {
    try {
      const res = await http.get(API_ROUTES.productCategories);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async createCategory(payload: Partial<ProductCategory>) {
    try {
      const res = await http.post(API_ROUTES.productCategories, payload);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },

  async getLowStockProducts() {
    try {
      const res = await http.get(API_ROUTES.productsLowStock);
      return responseData(res.data.data);
    } catch (e) { return responseError(e); }
  },
};
