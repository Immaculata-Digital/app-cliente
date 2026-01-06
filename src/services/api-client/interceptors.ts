/**
 * Interceptors para o HttpClient
 * 
 * Responsabilidade: Adicionar comportamentos transversais às requisições
 * - Autenticação automática
 * - Tratamento de erros
 * - Logging
 * - Schema header (X-Schema) para API de usuários
 */

import { RequestConfig } from './http-client';
import Cookies from 'js-cookie';
import { getSchemaFromHostname } from '@/utils/schema.utils';

/**
 * Adiciona o token de autenticação automaticamente nas requisições
 */
export const authInterceptor = (config: RequestConfig): RequestConfig => {
  // Se skipAuth for true, não adiciona o token e remove qualquer Authorization existente
  if (config.skipAuth === true) {
    console.log('[Auth Interceptor] Skipping auth for this request - skipAuth is true');
    // Remove Authorization header se existir e garante que não será adicionado
    const headers: HeadersInit = {};
    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'authorization') {
          headers[key] = value;
        }
      });
    }
    return {
      ...config,
      headers,
      skipAuth: true, // Garante que skipAuth seja preservado
    };
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

/**
 * Adiciona o header X-Schema automaticamente nas requisições
 * Necessário para rotas de grupos e usuários na API de usuários
 */
export const schemaInterceptor = (config: RequestConfig): RequestConfig => {
  // Só adiciona o schema se não for uma requisição skipAuth
  if (config.skipAuth === true) {
    return config;
  }

  try {
    // Converte headers para objeto simples para facilitar manipulação
    const existingHeaders = config.headers || {};
    let headersObj: Record<string, string> = {};
    
    if (existingHeaders instanceof Headers) {
      existingHeaders.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else if (Array.isArray(existingHeaders)) {
      existingHeaders.forEach(([key, value]) => {
        headersObj[key] = value;
      });
    } else {
      headersObj = { ...(existingHeaders as Record<string, string>) };
    }
    
    // Verifica se o header X-Schema já está presente (case-insensitive)
    const headerKeys = Object.keys(headersObj);
    const hasSchemaHeader = headerKeys.some(
      key => key.toLowerCase() === 'x-schema'
    );

    if (!hasSchemaHeader) {
      const schema = getSchemaFromHostname();
      
      // Preserva os headers existentes e adiciona X-Schema
      const newHeaders: Record<string, string> = {
        ...headersObj,
        'X-Schema': schema,
      };
      
      return {
        ...config,
        headers: newHeaders,
      };
    }
  } catch (error) {
    console.error('[Schema Interceptor] Erro ao processar schema:', error);
  }

  return config;
};
