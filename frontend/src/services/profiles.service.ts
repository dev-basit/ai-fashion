import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";
import type { Profile } from "@/types/database";
import type { UserRole } from "@/types/database";

type ProfileUpdate = Partial<Pick<Profile, "full_name" | "phone" | "is_active" | "notes" | "date_of_birth">> & {
  role?: UserRole;
};

export const profilesService = {
  async getAll() {
    try {
      const res = await http.get(API_ROUTES.profiles);
      return responseData(res.data.data as Profile[]);
    } catch (e) {
      return responseError(e);
    }
  },

  async getById(id: string) {
    try {
      const res = await http.get(API_ROUTES.profileById(id));
      return responseData(res.data.data as Profile);
    } catch (e) {
      return responseError(e);
    }
  },

  async update(id: string, updates: ProfileUpdate) {
    try {
      const res = await http.patch(API_ROUTES.profileById(id), updates);
      return responseData(res.data.data as Profile);
    } catch (e) {
      return responseError(e);
    }
  },
};
