import http from "./http";
import { API_ROUTES } from "@/config/constants";
import { responseData, responseError } from "@/lib/utils";

export const chatService = {
  async getConversations(_profileId: string) {
    try {
      const res = await http.get(API_ROUTES.chatConversations);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getOrCreateDirectConversation(_profileId1: string, profileId2: string) {
    try {
      const res = await http.post(API_ROUTES.chatConversations, { recipientId: profileId2 });
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getMessages(conversationId: string, limit = 50) {
    try {
      const res = await http.get(API_ROUTES.chatMessages(conversationId), { params: { limit } });
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async sendMessage(payload: { conversation_id: string; sender_id: string; content: string }) {
    try {
      const res = await http.post(API_ROUTES.chatMessages(payload.conversation_id), payload);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async markAsRead(conversationId: string, _profileId: string) {
    try {
      const res = await http.post(API_ROUTES.chatMarkRead(conversationId));
      return responseData(res.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async createGroupConversation(title: string, _createdBy: string, participantIds: string[]) {
    try {
      const res = await http.post(API_ROUTES.chatConversations, {
        title,
        is_group: true,
        participant_ids: participantIds,
      });
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },

  async getRecipients() {
    try {
      const res = await http.get(API_ROUTES.chatRecipients);
      return responseData(res.data.data);
    } catch (e) {
      return responseError(e);
    }
  },
};
