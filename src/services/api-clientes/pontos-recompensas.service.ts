/**
 * Serviço de Recompensas de Pontos - API Clientes
 * 
 * Responsabilidade: Gerenciar catálogo de recompensas disponíveis
 */

import { apiClientClientes } from '../api-client/http-client.factory';
import type { PontosRecompensasResponse } from '@/types/cliente-pontos-recompensas';
import type { PontosRecompensa } from '@/types/cliente-pontos-recompensas';

interface ItensRecompensaResponse {
  data: Array<{
    id_item_recompensa: number;
    nome_item: string;
    imagem_item: string | null;
    qtd_pontos: number;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Serviço de gerenciamento de recompensas
 */
class PontosRecompensasService {
  /**
   * Obter catálogo de recompensas disponíveis
   */
  async getRecompensas(
    schema: string,
    id_cliente: number
  ): Promise<PontosRecompensasResponse> {
    const response = await apiClientClientes.get<PontosRecompensasResponse>(
      `/clientes/${schema}/${id_cliente}/pontos-recompensas`
    );
    return response;
  }

  /**
   * Obter itens de recompensa disponíveis por schema (público, sem autenticação)
   */
  async getItensDisponiveis(schema: string): Promise<PontosRecompensa[]> {
    const response = await apiClientClientes.get<ItensRecompensaResponse>(
      `/itens-recompensa/${schema}?limit=100`,
      { skipAuth: true }
    );
    
    // Transforma a resposta da API para o formato esperado
    return response.data.map(item => ({
      id_item_recompensa: item.id_item_recompensa,
      nome_item: item.nome_item,
      foto: item.imagem_item,
      qtd_pontos: item.qtd_pontos,
    }));
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const pontosRecompensasService = new PontosRecompensasService();
