import { HttpClientFactory } from "./http-client.factory";

const API_BASE_URL = import.meta.env.VITE_API_USUARIOS_URL || "http://localhost:8000/api";

export const apiClient = HttpClientFactory.create(API_BASE_URL);
