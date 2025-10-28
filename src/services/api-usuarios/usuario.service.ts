/**
 * Serviço de Usuários - API Usuários
 * 
 * Responsabilidade: Gerenciar operações CRUD de usuários
 * - Criar, listar, atualizar e deletar usuários
 * - Buscar usuários por texto
 * - Gerenciar funcionalidades extras de usuários
 */

import { apiClientUsuarios } from '../api-client/api-client-usuarios.instance';
import type {
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
  UsuarioFilters,
  UsuarioListResponse,
  UsuarioFuncionalidade,
  UsuarioFuncionalidadeCreate
} from '../../types/usuario';

/**
 * Serviço de gerenciamento de usuários
 */
class UsuarioService {
  /**
   * Lista usuários com filtros e paginação
   */
  async list(filters: UsuarioFilters = {}): Promise<UsuarioListResponse> {
    const params: Record<string, any> = {
      page: filters.page || 1,
      limit: filters.limit || 10,
    };

    if (filters.q) {
      params.q = filters.q;
    }

    if (filters.id_grupo_usuario) {
      params.id_grupo_usuario = filters.id_grupo_usuario;
    }

    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }

    if (filters.sortOrder) {
      params.sortOrder = filters.sortOrder;
    }

    return await apiClientUsuarios.get<UsuarioListResponse>('/usuarios', { params });
  }

  /**
   * Busca usuários por texto (login ou email)
   */
  async searchByText(q: string, page = 1, limit = 10): Promise<UsuarioListResponse> {
    return await apiClientUsuarios.get<UsuarioListResponse>('/usuarios/buscar-por-texto', {
      params: { q, page, limit }
    });
  }

  /**
   * Busca um usuário por ID
   */
  async getById(id: number): Promise<Usuario> {
    return await apiClientUsuarios.get<Usuario>(`/usuarios/${id}`);
  }

  /**
   * Cria um novo usuário
   */
  async create(data: UsuarioCreate): Promise<Usuario> {
    return await apiClientUsuarios.post<Usuario>('/usuarios', data);
  }

  /**
   * Atualiza um usuário existente
   */
  async update(id: number, data: UsuarioUpdate): Promise<Usuario> {
    return await apiClientUsuarios.put<Usuario>(`/usuarios/${id}`, data);
  }

  /**
   * Remove um usuário
   */
  async remove(id: number): Promise<void> {
    await apiClientUsuarios.delete(`/usuarios/${id}`);
  }

  /**
   * Reseta a senha de um usuário (envia email)
   */
  async resetPassword(id: number): Promise<void> {
    await apiClientUsuarios.post(`/usuarios/${id}/reset-password`);
  }

  /**
   * Lista funcionalidades extras de um usuário
   */
  async getFuncionalidadesExtras(id_usuario: number): Promise<UsuarioFuncionalidade[]> {
    const response = await apiClientUsuarios.get<{ data: UsuarioFuncionalidade[] }>(
      '/usuarios-funcionalidades',
      { params: { id_usuario } }
    );
    return response.data;
  }

  /**
   * Adiciona uma funcionalidade extra a um usuário
   */
  async addFuncionalidadeExtra(data: UsuarioFuncionalidadeCreate): Promise<UsuarioFuncionalidade> {
    return await apiClientUsuarios.post<UsuarioFuncionalidade>(
      '/usuarios-funcionalidades',
      data
    );
  }

  /**
   * Remove uma funcionalidade extra de um usuário
   */
  async removeFuncionalidadeExtra(id: number): Promise<void> {
    await apiClientUsuarios.delete(`/usuarios-funcionalidades/${id}`);
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const usuarioService = new UsuarioService();
