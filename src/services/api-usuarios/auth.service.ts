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
  loginOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    login: string;
    email: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
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
        await apiClientUsuarios.post<{ status: string; message: string }>(
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
      '/auth/refresh-token',
      { refreshToken },
      { skipAuth: true }
    );

    // Atualizar tokens armazenados
    Cookies.set('access_token', response.accessToken, {
      expires: 1,
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });

    const storage = sessionStorage.getItem('refresh_token') ? sessionStorage : localStorage;
    storage.setItem('refresh_token', response.refreshToken);

    return response;
  }

  /**
   * Armazena os tokens de forma segura
   * @param response - Response do login com tokens
   * @param useSessionStorage - Se true, usa sessionStorage ao invés de localStorage
   */
  private storeTokens(response: LoginResponse, useSessionStorage = false): void {
    const storage = useSessionStorage ? sessionStorage : localStorage;
    
    Cookies.set('access_token', response.accessToken, {
      expires: 1, // 1 dia (padrão para tokens JWT)
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });

    storage.setItem('refresh_token', response.refreshToken);
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
