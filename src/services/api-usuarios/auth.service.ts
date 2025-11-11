/**
 * Serviço de Autenticação - API Usuários
 * 
 * Responsabilidade: Gerenciar autenticação e tokens
 * - Login/Logout
 * - Refresh de tokens
 * - Armazenamento seguro de tokens
 */

import { apiClientUsuarios } from '../api-client/api-client-usuarios.instance';
import Cookies from 'js-cookie';

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  user: {
    id_usuario: number;
    login: string;
    email: string;
    id_grupo_usuario: number;
    id_cliente: number | null;
    nome_completo: string | null;
    nome?: string;
    funcionalidades?: Array<{
      id_funcionalidade: number;
      codigo: string;
      descricao: string;
      ativo: boolean;
      id_grupo_funcionalidade: number;
    }>;
  };
  access_token: string;
  access_expires_in: string;
  refresh_token: string;
  refresh_expires_in: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Serviço de autenticação
 * Singleton para garantir uma única instância
 */
class AuthService {
  /**
   * Faz login e armazena os tokens
   */
  async login(credentials: LoginRequest, rememberMe = false): Promise<LoginResponse> {
    const response = await apiClientUsuarios.post<LoginResponse>(
      '/auth/login',
      credentials,
      { skipAuth: true }
    );

    this.storeTokens(response, !rememberMe);

    return response;
  }

  /**
   * Faz logout e limpa os tokens
   */
  async logout(): Promise<void> {
    const refreshToken = 
    sessionStorage.getItem('refresh_token') || 
    localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await apiClientUsuarios.post<LoginResponse>(
          '/auth/logout',
          { refreshToken }        
        );
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    this.clearTokens();
  }

  /**
   * Atualiza o access token usando o refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = 
      sessionStorage.getItem('refresh_token') || 
      localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('NO_REFRESH_TOKEN');
    }

    const response = await apiClientUsuarios.post<RefreshTokenResponse>(
      '/auth/refresh',
      { refreshToken, access_expires_in: "15m" },
      { skipAuth: true }
    );

    Cookies.set('access_token', response.accessToken, {
      expires: 1,
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });

    return response;
  }

  /**
   * Armazena os tokens de forma segura
   * @param response - Response do login com tokens
   * @param useSessionStorage - Se true, usa sessionStorage ao invés de localStorage
   */
  private storeTokens(response: LoginResponse, useSessionStorage = false): void {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    
    Cookies.set('access_token', response.access_token, {
      expires: parseInt(response.access_expires_in) / (24 * 60 * 60),
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });

    storage.setItem('refresh_token', response.refresh_token);
    storage.setItem('access_expires_in', response.access_expires_in);
  }

  /**
   * Limpa todos os tokens armazenados
   */
  private clearTokens(): void {
    Cookies.remove('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_expires_in');
    sessionStorage.clear();
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  }

  /**
   * Retorna o access token atual
   */
  getAccessToken(): string | undefined {
    return Cookies.get('access_token');
  }

  /**
   * Retorna o refresh token atual
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const authService = new AuthService();
