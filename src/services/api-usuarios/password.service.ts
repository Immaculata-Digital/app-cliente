import { apiClient } from "../api-client/api-client.instance";

export const passwordService = {
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient.post("/auth/password/forgot/", { email });
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    return apiClient.post("/auth/password/reset/", { token, password });
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    return apiClient.post("/auth/password/change/", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
