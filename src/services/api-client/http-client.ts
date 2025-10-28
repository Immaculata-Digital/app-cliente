/**
 * Cliente HTTP Base
 * 
 * Responsabilidade: Gerenciar requisições HTTP de forma centralizada
 * Princípios SOLID aplicados:
 * - Single Responsibility: Apenas gerencia requisições HTTP
 * - Open/Closed: Extensível através de interceptors
 * - Dependency Inversion: Depende de abstrações (RequestConfig)
 */

export interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  skipAuth?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  total: number;
  itens: T[];
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = <T>(response: Response) => Promise<T>;
type ErrorInterceptor = (error: Error) => Promise<never>;

/**
 * Cliente HTTP com suporte a interceptors
 */
export class HttpClient {
  private baseURL: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Adiciona um interceptor de requisição
   * Útil para adicionar headers, tokens, logging, etc.
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Adiciona um interceptor de resposta
   * Útil para transformar dados, cache, etc.
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Adiciona um interceptor de erro
   * Útil para tratamento centralizado de erros, retry, etc.
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Constrói a URL completa com query params
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = `${this.baseURL}${endpoint}`;
    
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Aplica interceptors de requisição
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = config;
    
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    
    return finalConfig;
  }

  /**
   * Aplica interceptors de resposta
   */
  private async applyResponseInterceptors<T>(response: Response): Promise<T> {
    let result: any = response;
    
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    
    return result;
  }

  /**
   * Aplica interceptors de erro
   */
  private async applyErrorInterceptors(error: Error): Promise<never> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error);
    }
    throw error;
  }

  /**
   * Método genérico de requisição
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    try {
      // Aplica interceptors de requisição
      const finalConfig = await this.applyRequestInterceptors(config);

      // Constrói URL com params
      const url = this.buildURL(endpoint, finalConfig.params);
      console.log('[HttpClient] Making request to:', url);

      // Remove params do config pois já foram adicionados à URL
      const { params, ...fetchConfig } = finalConfig;

      // Faz a requisição
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        },
        ...fetchConfig,
      });

      // Verifica se houve erro HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error ${response.status}`);
      }

      // Processa a resposta (se não for 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      // Aplica interceptors de resposta
      return await this.applyResponseInterceptors<T>(response);

    } catch (error) {
      // Aplica interceptors de erro
      return await this.applyErrorInterceptors(
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Métodos HTTP convenientes
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}
