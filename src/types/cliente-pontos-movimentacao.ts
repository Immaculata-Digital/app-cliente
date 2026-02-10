/**
 * Tipos relacionados a movimentações de pontos de clientes
 */

export type TipoMovimentacao = 'CREDITO' | 'DEBITO' | 'ESTORNO';
export type OrigemMovimentacao = 'MANUAL' | 'RESGATE' | 'AJUSTE' | 'PROMO' | 'OUTRO';
export type StatusMovimentacao = 'PENDENTE' | 'CONFIRMADO' | 'ESTORNADO' | 'CANCELADO';

/**
 * Interface da movimentação de pontos
 */
export interface ClientePontosMovimentacao {
  id_pontos_movimentacao: number;
  id_cliente: number;
  tipo: TipoMovimentacao;
  origem: OrigemMovimentacao;
  pontos: number;
  saldo_anterior: number;
  saldo_novo: number;
  descricao?: string;
  observacao?: string;
  id_item_recompensa?: number;
  id_loja?: number;
  id_usuario_operacao?: number;
  status: StatusMovimentacao;
  dt_movimentacao: string;
  dt_cadastro: string;
  usu_cadastro: number;
  dt_altera?: string;
  usu_altera?: number;
  codigo_resgate?: string;
  resgate_utilizado?: boolean;
}

/**
 * Request para criar movimentação
 */
export interface CreateMovimentacaoRequest {
  tipo: TipoMovimentacao;
  origem: OrigemMovimentacao;
  pontos: number;
  descricao?: string;
  observacao?: string;
  id_item_recompensa?: number;
  id_loja?: number;
}

/**
 * Request para atualizar movimentação
 */
export interface UpdateMovimentacaoRequest {
  descricao?: string;
  observacao?: string;
  status?: StatusMovimentacao;
}

/**
 * Response da movimentação
 */
export interface MovimentacaoResponse {
  movimentacao: ClientePontosMovimentacao;
  saldo_atual: number;
}

export interface ResgateMovimentacao {
  id_movimentacao: number;
  id_cliente: number;
  tipo: TipoMovimentacao;
  pontos: number;
  saldo_resultante: number;
  origem: OrigemMovimentacao;
  id_loja: number | null;
  id_item_recompensa: number | null;
  observacao?: string | null;
  schema: string;
  usu_cadastro: number;
  dt_cadastro: string;
  updatedAt?: string;
  id_mov_ref?: number | null;
}

export interface ResgateResponse {
  movimentacao: ResgateMovimentacao;
  saldo_atual: number;
  codigo_resgate?: string;
  resgate_utilizado?: boolean | null;
  solicitacao_enviada?: boolean;
}

/**
 * Filtros para busca de extrato
 */
export interface ExtratoFilters {
  page?: number;
  limit?: number;
  dt_ini?: string;
  dt_fim?: string;
  tipo?: TipoMovimentacao;
  origem?: OrigemMovimentacao;
  order?: 'asc' | 'desc';
  q?: string; // Para busca por texto
}

/**
 * Response do extrato
 */
export interface ExtratoResponse {
  movimentacoes: ClientePontosMovimentacao[];
  saldo_atual: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Dados do cliente
 */
export interface Cliente {
  id_cliente: number;
  codigo: string; // Código único do cliente (exibido no app)
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  saldo_pontos: number;
  ativo: boolean;
  dt_cadastro: string;
  dt_altera?: string;
}
