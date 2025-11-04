/**
 * HTTP Client Factory
 * 
 * Factory pattern para criar instâncias configuradas do HttpClient
 * Reduz duplicação de código e centraliza configuração
 */

import { HttpClient } from './http-client';
import {
  authInterceptor,
  jsonResponseInterceptor,
  errorInterceptor,
  loggingInterceptor,
} from './interceptors';

export interface HttpClientConfig {
  baseURL: string;
  enableAuth?: boolean;
  enableLogging?: boolean;
  customInterceptors?: {
    request?: Array<(config: any) => any | Promise<any>>;
    response?: Array<(response: any) => Promise<any>>;
    error?: Array<(error: Error) => Promise<never>>;
  };
}

/**
 * Cria uma instância configurada do HttpClient
 * 
 * @example
 * ```ts
 * const apiClient = createHttpClient({
 *   baseURL: 'https://api.example.com',
 *   enableAuth: true,
 *   enableLogging: true
 * });
 * ```
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  const client = new HttpClient(config.baseURL);

  // Adiciona interceptors padrão
  if (config.enableAuth !== false) {
    client.addRequestInterceptor(authInterceptor);
  }

  if (config.enableLogging !== false && process.env.NODE_ENV === 'development') {
    client.addRequestInterceptor(loggingInterceptor);
  }

  client.addResponseInterceptor(jsonResponseInterceptor);
  client.addErrorInterceptor(errorInterceptor);

  // Adiciona interceptors customizados se fornecidos
  if (config.customInterceptors?.request) {
    config.customInterceptors.request.forEach(interceptor => {
      client.addRequestInterceptor(interceptor);
    });
  }

  if (config.customInterceptors?.response) {
    config.customInterceptors.response.forEach(interceptor => {
      client.addResponseInterceptor(interceptor);
    });
  }

  if (config.customInterceptors?.error) {
    config.customInterceptors.error.forEach(interceptor => {
      client.addErrorInterceptor(interceptor);
    });
  }

  return client;
}

/**
 * Instâncias pré-configuradas dos clientes HTTP
 */

// Cliente para API Admin (gestão interna)
export const apiClientAdmin = createHttpClient({
  baseURL: import.meta.env.VITE_API_HOMOLOG_ADMIN_URL || 'http://localhost:7771',
  enableAuth: true,
  enableLogging: true,
});

// Cliente para API Usuários (autenticação e gestão de usuários)
export const apiClientUsuarios = createHttpClient({
  baseURL: import.meta.env.VITE_API_HOMOLOG_USUARIOS_URL || 'https://homolog-api-usuarios.immaculatadigital.com.br/api',
  enableAuth: true,
  enableLogging: true,
});

// Cliente para API Clientes (movimentação de pontos e dados do cliente)
export const apiClientClientes = createHttpClient({
  baseURL: import.meta.env.VITE_API_HOMOLOG_CLIENTES_URL || 'https://homolog-api-clientes.immaculatadigital.com.br/',
  enableAuth: true,
  enableLogging: true,
});

// Cliente sem autenticação (para endpoints públicos)
export const apiClientPublic = createHttpClient({
  baseURL: import.meta.env.VITE_API_HOMOLOG_ADMIN_URL || 'http://localhost:7771',
  enableAuth: false,
  enableLogging: false,
});
