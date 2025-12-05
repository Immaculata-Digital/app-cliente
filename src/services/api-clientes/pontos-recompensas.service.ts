/**
 * Serviço de Recompensas de Pontos - API Clientes
 * 
 * Responsabilidade: Gerenciar catálogo de recompensas disponíveis
 */

import { apiClientClientes } from '../api-client/http-client.factory';
import { apiClientAdmin } from '../api-client/http-client.factory';
import { clienteService, type ClienteData } from './cliente.service';
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
   * Combina dados do cliente (API clientes v2) com itens de recompensa (API admin v2)
   */
  async getRecompensas(
    schema: string,
    id_cliente: number
  ): Promise<PontosRecompensasResponse> {
    try {
      // Buscar dados do cliente na API clientes v2
      const cliente = await clienteService.getCliente(schema, id_cliente);
      
      // Buscar itens de recompensa na API admin v2
      const itensRecompensa = await this.getItensDisponiveis(schema);
      
      // Montar resposta no formato esperado
      return {
        quantidade_pontos: cliente.saldo,
        codigo_cliente: `CLI-${cliente.id_cliente}`,
        recompensas: itensRecompensa,
      };
    } catch (error: any) {
      // Se não encontrar cliente, retorna estrutura vazia
      console.error('[PontosRecompensasService] Erro ao buscar recompensas:', error);
      return {
        quantidade_pontos: 0,
        codigo_cliente: `CLI-${id_cliente}`,
        recompensas: [],
      };
    }
  }

  /**
   * Obter itens de recompensa disponíveis por schema (público, sem autenticação)
   * Usa API Admin V2 para buscar itens de recompensa
   */
  async getItensDisponiveis(schema: string): Promise<PontosRecompensa[]> {
    // API Admin V2 retorna formato { itens: [...], total: ... }
    const response = await apiClientAdmin.get<{
      itens: Array<{
        id_item_recompensa: number;
        nome_item: string;
        imagem_item: string | null;
        quantidade_pontos: number;
        nao_retirar_loja: boolean;
      }>;
      total: number;
    }>(
      `/${schema}/itens-recompensa?limit=100`,
      { skipAuth: true }
    );
    
    // Transforma a resposta da API para o formato esperado
    return (response.itens || []).map(item => ({
      id_item_recompensa: item.id_item_recompensa,
      nome_item: item.nome_item,
      foto: item.imagem_item,
      qtd_pontos: item.quantidade_pontos,
      nao_retirar_loja: Boolean(item.nao_retirar_loja),
    }));
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const pontosRecompensasService = new PontosRecompensasService();
