import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { StaffProfile, StaffSchedule } from "@/types/database";

export const staffService = {
  async getAll() {
    try {
      const res = await http.get(API_ROUTES.staff);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getById(id: string) {
    try {
      const res = await http.get(API_ROUTES.staffById(id));
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getByProfileId(profileId: string) {
    try {
      const res = await http.get(API_ROUTES.staff, { params: { profileId } });
      return responseData(Array.isArray(res.data.data) ? (res.data.data[0] ?? null) : res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async create(payload: Partial<StaffProfile>) {
    try {
      const res = await http.post(API_ROUTES.staff, payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async update(id: string, payload: Partial<StaffProfile>) {
    try {
      const res = await http.patch(API_ROUTES.staffById(id), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async setAvailability(id: string, isAvailable: boolean) {
    try {
      const res = await http.patch(API_ROUTES.staffById(id), { is_available: isAvailable });
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async deactivateProfile(profileId: string) {
    try {
      const res = await http.patch(API_ROUTES.clientById(profileId), { is_active: false });
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getSchedule(staffProfileId: string) {
    try {
      const res = await http.get(API_ROUTES.staffSchedule(staffProfileId));
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async upsertSchedule(schedules: Partial<StaffSchedule>[]) {
    const staffProfileId = schedules[0]?.staff_profile_id ?? "";
    try {
      const res = await http.put(API_ROUTES.staffSchedule(staffProfileId), schedules);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getLeaves(staffProfileId: string) {
    try {
      const res = await http.get(API_ROUTES.staffLeaves(staffProfileId));
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async createLeave(payload: { staff_profile_id: string; starts_at: string; ends_at: string; reason?: string }) {
    try {
      const res = await http.post(API_ROUTES.staffLeaves(payload.staff_profile_id), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async assignService(staffProfileId: string, serviceId: string) {
    try {
      const res = await http.post(API_ROUTES.staffServices(staffProfileId), { service_id: serviceId });
      return responseData(res.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async removeService(staffProfileId: string, serviceId: string) {
    try {
      const res = await http.delete(API_ROUTES.staffServiceById(staffProfileId, serviceId));
      return responseData(res.data);
    } catch (e) {
      return responseError(e);
    }
  },
};
