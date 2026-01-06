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
      console.log('[PontosRecompensasService] Buscando recompensas para cliente:', { schema, id_cliente });
      
      // Buscar dados do cliente na API clientes v2
      let cliente: ClienteData | null = null;
      try {
        cliente = await clienteService.getCliente(schema, id_cliente);
        console.log('[PontosRecompensasService] Cliente encontrado:', cliente);
      } catch (error: any) {
        console.error('[PontosRecompensasService] Erro ao buscar cliente:', error);
        // Continua mesmo se não encontrar cliente, para tentar buscar itens
      }
      
      // Buscar itens de recompensa na API admin v2
      let itensRecompensa: PontosRecompensa[] = [];
      try {
        itensRecompensa = await this.getItensDisponiveis(schema);
        console.log('[PontosRecompensasService] Itens de recompensa encontrados:', itensRecompensa.length);
      } catch (error: any) {
        console.error('[PontosRecompensasService] Erro ao buscar itens de recompensa:', error);
        // Continua mesmo se não encontrar itens
      }
      
      // Montar resposta no formato esperado
      const response: PontosRecompensasResponse = {
        quantidade_pontos: cliente?.saldo ?? 0,
        codigo_cliente: cliente ? `CLI-${cliente.id_cliente}` : `CLI-${id_cliente}`,
        recompensas: itensRecompensa,
      };
      
      console.log('[PontosRecompensasService] Resposta final:', response);
      return response;
    } catch (error: any) {
      // Se houver erro geral, retorna estrutura vazia
      console.error('[PontosRecompensasService] Erro geral ao buscar recompensas:', error);
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
    try {
      // API Admin V2 retorna formato { itens: [...], total: ... }
      const response = await apiClientAdmin.get<any>(
        `/${schema}/itens-recompensa?limit=100`,
        { skipAuth: true }
      );
      
      console.log('[PontosRecompensasService] Resposta da API Admin:', response);
      
      // Verifica se a resposta tem a estrutura esperada
      if (!response) {
        console.warn('[PontosRecompensasService] Resposta vazia da API Admin');
        return [];
      }
      
      // Verifica se tem itens ou se está em outro formato
      let itens: any[] = [];
      
      if (response && typeof response === 'object') {
        // Tenta diferentes formatos de resposta
        if (Array.isArray(response)) {
          // Se a resposta é um array direto
          itens = response;
        } else if (response.itens && Array.isArray(response.itens)) {
          // Formato esperado: { itens: [...], total: ... }
          itens = response.itens;
        } else if ((response as any).data && Array.isArray((response as any).data)) {
          // Formato alternativo: { data: [...], pagination: ... }
          itens = (response as any).data;
        } else {
          console.warn('[PontosRecompensasService] Formato de resposta não reconhecido:', response);
          return [];
        }
      } else {
        console.warn('[PontosRecompensasService] Resposta inválida:', response);
        return [];
      }
      
      if (!Array.isArray(itens) || itens.length === 0) {
        console.log('[PontosRecompensasService] Nenhum item encontrado na resposta');
        return [];
      }
      
      // Transforma a resposta da API para o formato esperado
      const mappedItems = itens.map(item => {
        // Garante que todos os campos necessários existam
        if (!item || typeof item !== 'object') {
          console.warn('[PontosRecompensasService] Item inválido ignorado:', item);
          return null;
        }
        
        return {
          id_item_recompensa: item.id_item_recompensa,
          nome_item: item.nome_item || '',
          foto: item.imagem_item || null,
          qtd_pontos: item.quantidade_pontos || item.qtd_pontos || 0,
          nao_retirar_loja: Boolean(item.nao_retirar_loja),
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);
      
      return mappedItems as PontosRecompensa[];
    } catch (error: any) {
      console.error('[PontosRecompensasService] Erro ao buscar itens de recompensa:', error);
      throw error;
    }
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const pontosRecompensasService = new PontosRecompensasService();
