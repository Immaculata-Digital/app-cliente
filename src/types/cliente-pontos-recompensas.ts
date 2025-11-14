/**
 * Tipos relacionados a recompensas de pontos de clientes
 */

/**
 * Interface da recompensa
 */
export interface PontosRecompensa {
  id_item_recompensa: number;
  nome_item: string;
  foto: string | null; // Base64 ou URL da imagem
  qtd_pontos: number;
}

/**
 * Response das recompensas disponíveis
 */
export interface PontosRecompensasResponse {
  quantidade_pontos: number;
  codigo_cliente: string;
  recompensas: PontosRecompensa[];
}
