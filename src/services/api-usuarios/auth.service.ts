import { apiClient } from "../api-client/api-client.instance";
import { AuthResponse, User } from "@/types/permissions";

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post("/auth/login/", { email, password });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get("/auth/me/");
  },

  logout: async (): Promise<void> => {
    return apiClient.post("/auth/logout/");
  },
};
