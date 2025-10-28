/**
 * Interceptors para o HttpClient
 * 
 * Responsabilidade: Adicionar comportamentos transversais às requisições
 * - Autenticação automática
 * - Tratamento de erros
 * - Logging
 */

import { RequestConfig } from './http-client';
import Cookies from 'js-cookie';

/**
 * Adiciona o token de autenticação automaticamente nas requisições
 */
export const authInterceptor = (config: RequestConfig): RequestConfig => {
  // Se skipAuth for true, não adiciona o token
  if (config.skipAuth) {
    console.log('[Auth Interceptor] Skipping auth for this request');
    return config;
  }

  // Busca o token do cookie ou storage (fallback)
  const token =
    Cookies.get('access_token') ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('access_token') || localStorage.getItem('access_token') || undefined : undefined);

  if (token) {
    console.log('[Auth Interceptor] Token found, adding to request:', String(token).substring(0, 20) + '...');
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  console.warn('[Auth Interceptor] No token found in cookies/storage');
  return config;
};

/**
 * Transforma a resposta JSON automaticamente
 */
export const jsonResponseInterceptor = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return await response.json();
  }
  
  return response as unknown as T;
};

/**
 * Trata erros de forma centralizada
 */
export const errorInterceptor = async (error: Error): Promise<never> => {
  // Log do erro (em produção, enviar para serviço de monitoramento)
  console.error('[API Error]', {
    message: error.message,
    timestamp: new Date().toISOString(),
  });

  // Re-throw para que o código chamador possa tratar
  throw error;
};

/**
 * Adiciona logging de requisições (útil para debug)
 */
export const loggingInterceptor = (config: RequestConfig): RequestConfig => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Request]', {
      method: config.method || 'GET',
      url: config.params ? `with params: ${JSON.stringify(config.params)}` : '',
      headers: config.headers,
      timestamp: new Date().toISOString(),
    });
  }
  
  return config;
};
