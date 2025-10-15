import { apiClient } from "../api-client/api-client.instance";
import { GrupoUsuario } from "@/types/permissions";

export const grupoUsuarioService = {
  list: async (): Promise<GrupoUsuario[]> => {
    return apiClient.get("/grupos/");
  },

  get: async (id: number): Promise<GrupoUsuario> => {
    return apiClient.get(`/grupos/${id}/`);
  },

  create: async (data: Partial<GrupoUsuario>): Promise<GrupoUsuario> => {
    return apiClient.post("/grupos/", data);
  },

  update: async (id: number, data: Partial<GrupoUsuario>): Promise<GrupoUsuario> => {
    return apiClient.put(`/grupos/${id}/`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/grupos/${id}/`);
  },
};
