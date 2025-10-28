// Funcionalidade representa uma permissão granular no sistema
export interface Funcionalidade {
  chave: string; // Ex: "GESTAO-USUARIOS", "PONTOS-CREDITAR", "LOJAS-CRIAR"
}

// Tipos de funcionalidade existentes no sistema
export type FuncionalidadeChave =
  // Módulos principais (acesso ao menu)
  | "GESTAO-USUARIOS"
  | "GESTAO-CLIENTES"
  | "ITENS-RECOMPENSA"
  | "CONFIGURACOES"
  | "LOJAS"
  | "PERMISSOES-GRUPOS"
  | "GESTAO-FUNCIONALIDADES"
  // Funcionalidades granulares (futuro)
  | "ITENS-RECOMPENSA-CRIAR"
  | "ITENS-RECOMPENSA-EDITAR"
  | "ITENS-RECOMPENSA-EXCLUIR"
  | "PONTOS-CREDITAR"
  | "PONTOS-DEBITAR"
  | "LOJAS-CRIAR"
  | "LOJAS-EDITAR"
  | "LOJAS-EXCLUIR";

// Interface para gestão de funcionalidades (CRUD)
export interface FuncionalidadeGestao {
  id_funcionalidade: number;
  descricao: string;
  chave: string;
  dt_cadastro: string;
  usu_cadastro: string;
  dt_altera?: string;
  usu_altera?: string;
}

export interface FuncionalidadeCreate {
  descricao: string;
  chave: string;
}

export interface FuncionalidadeUpdate {
  descricao?: string;
  chave?: string;
}

export interface FuncionalidadeFilters {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FuncionalidadeListResponse {
  data: FuncionalidadeGestao[];
  total: number;
  page: number;
  limit: number;
}
