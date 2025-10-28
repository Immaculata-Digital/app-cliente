/**
 * Tipos relacionados a usuários
 */

export interface Usuario {
  id_usuario: number;
  login: string;
  email: string;
  nome?: string;
  id_grupo_usuario: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface UsuarioCreate {
  login: string;
  email: string;
  senha: string;
  nome?: string;
  id_grupo_usuario: number;
}

export interface UsuarioUpdate {
  login?: string;
  email?: string;
  senha?: string;
  nome?: string;
  id_grupo_usuario?: number;
  ativo?: boolean;
}

export interface UsuarioFilters {
  q?: string;
  id_grupo_usuario?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsuarioListResponse {
  data: Usuario[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsuarioFuncionalidade {
  id: number;
  id_usuario: number;
  id_funcionalidade: number;
  criado_em: string;
}

export interface UsuarioFuncionalidadeCreate {
  id_usuario: number;
  id_funcionalidade: number;
}
