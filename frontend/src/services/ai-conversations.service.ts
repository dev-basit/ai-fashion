import http from "@/services/http";
import { responseData, responseError } from "@/lib/utils";

export const aiConversationsService = {
  async getConversations() {
    try {
      const res = await http.get("/ai/conversations");
      return responseData(res.data.data);
    } catch (e: unknown) {
      return responseError(e);
    }
  },

  async createConversation() {
    try {
      const res = await http.post("/ai/conversations");
      return responseData(res.data.data);
    } catch (e: unknown) {
      return responseError(e);
    }
  },

  async getMessages(conversationId: string) {
    try {
      const res = await http.get(`/ai/conversations/${conversationId}/messages`);
      return responseData(res.data.data);
    } catch (e: unknown) {
      return responseError(e);
    }
  },

  async deleteConversation(conversationId: string) {
    try {
      await http.delete(`/ai/conversations/${conversationId}`);
      return responseData(null);
    } catch (e: unknown) {
      return responseError(e);
    }
  },
};
