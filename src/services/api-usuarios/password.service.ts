/**
 * Serviço de Gerenciamento de Senhas - API Usuários
 * 
 * Responsabilidade: Gerenciar operações relacionadas a senhas
 * - Esqueci minha senha (forgot password)
 * - Reset de senha com token
 * - Alteração de senha (usuário logado)
 */

import { apiClientUsuarios } from '../api-client/api-client-usuarios.instance';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  novaSenha: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface ChangePasswordResponse {
  message: string;
}

/**
 * Serviço de gerenciamento de senhas
 */
class PasswordService {
  /**
   * Envia e-mail para recuperação de senha
   * @param email - E-mail do usuário
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return await apiClientUsuarios.post<ForgotPasswordResponse>(
      '/clientes/auth/password/forgot',
      { email },
      { skipAuth: true }
    );
  }

  /**
   * Reseta a senha usando o token recebido por e-mail
   * @param token - Token de recuperação
   * @param novaSenha - Nova senha
   */
  async resetPassword(token: string, novaSenha: string): Promise<ResetPasswordResponse> {
    return await apiClientUsuarios.post<ResetPasswordResponse>(
      '/clientes/auth/password/reset',
      { token, novaSenha },
      { skipAuth: true }
    );
  }

  /**
   * Altera a senha do usuário logado
   * @param idUsuario - ID do usuário
   * @param senhaAtual - Senha atual
   * @param novaSenha - Nova senha
   */
  async changePassword(
    idUsuario: number,
    senhaAtual: string,
    novaSenha: string
  ): Promise<ChangePasswordResponse> {
    return await apiClientUsuarios.put<ChangePasswordResponse>(
      `/usuarios/${idUsuario}/senha`,
      { senhaAtual, novaSenha }
    );
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const passwordService = new PasswordService();
