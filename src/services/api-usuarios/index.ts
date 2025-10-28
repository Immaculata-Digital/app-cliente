/**
 * Índice centralizado da API Usuários
 * 
 * Exporta todos os serviços relacionados à autenticação e gestão de usuários
 * Facilita imports e manutenção
 */

// Serviços de autenticação
export { authService } from './auth.service';
export { passwordService } from './password.service';
export { usuarioService } from './usuario.service';

// Types
export type { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenResponse 
} from './auth.service';

export type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse
} from './password.service';

// Cliente HTTP específico para API Usuários
export { apiClientUsuarios } from '../api-client/api-client-usuarios.instance';
