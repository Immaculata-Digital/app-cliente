/**
 * Serviço de Movimentação de Pontos - API Clientes
 * 
 * Responsabilidade: Gerenciar movimentações de pontos dos clientes
 * - Criar, listar, atualizar e estornar movimentações
 * - Buscar movimentações por texto
 * - Obter extrato de pontos
 */

import { apiClientClientes } from '../api-client/http-client.factory';
import { pontosMovimentacaoMock } from '../mocks/pontos-movimentacao.mock';
import type {
  CreateMovimentacaoRequest,
  UpdateMovimentacaoRequest,
  MovimentacaoResponse,
  ExtratoResponse,
  ExtratoFilters,
  ClientePontosMovimentacao,
  Cliente,
  ResgateResponse,
} from '@/types/cliente-pontos-movimentacao';

/**
 * Serviço de gerenciamento de movimentações de pontos
 */
class PontosMovimentacaoService {
  /**
   * Criar movimentação de pontos
   */
  async createMovimentacao(
    schema: string,
    id_cliente: number,
    data: CreateMovimentacaoRequest
  ): Promise<MovimentacaoResponse> {
    try {
      const response = await apiClientClientes.post<MovimentacaoResponse>(
        `/clientes/${schema}/${id_cliente}/pontos-movimentacoes`,
        data
      );
      return response;
    } catch (error: any) {
      console.warn('⚠️ API indisponível, usando mock');
      return await pontosMovimentacaoMock.createMovimentacao(schema, id_cliente, data);
    }
  }

  /**
   * Buscar código de resgate existente por cliente e item
   */
  async buscarCodigoExistente(
    schema: string,
    id_cliente: number,
    id_item_recompensa: number
  ): Promise<ResgateResponse | null> {
    try {
      const response = await apiClientClientes.get<{
        codigo_resgate: string;
        resgate_utilizado: boolean;
        id_cliente: number;
        id_item_recompensa: number;
        id_movimentacao: number | null;
        saldo_atual?: number;
        pontos?: number;
        saldo_resultante?: number;
        solicitacao_enviada?: boolean;
      }>(
        `/clientes/${schema}/${id_cliente}/codigos-resgate/item/${id_item_recompensa}`
      );
      
      // Transformar resposta para formato ResgateResponse
      return {
        movimentacao: {
          id_movimentacao: response.id_movimentacao || 0,
          id_cliente: response.id_cliente,
          tipo: 'DEBITO' as const,
          pontos: response.pontos || 0,
          saldo_resultante: response.saldo_resultante || response.saldo_atual || 0,
          origem: 'RESGATE' as const,
          id_loja: null,
          id_item_recompensa: response.id_item_recompensa,
          observacao: null,
          schema,
          usu_cadastro: 0,
          dt_cadastro: new Date().toISOString(),
        },
        saldo_atual: response.saldo_atual || 0,
        codigo_resgate: response.codigo_resgate,
        resgate_utilizado: response.resgate_utilizado,
        solicitacao_enviada: response.solicitacao_enviada ?? false,
      };
    } catch (error: any) {
      // Se não encontrar (404), retorna null
      if (error?.response?.status === 404) {
        return null;
      }
      // Outros erros são ignorados e retorna null
      console.warn('Erro ao buscar código existente:', error);
      return null;
    }
  }

  /**
   * Resgatar recompensa gerando código
   */
  async resgatarRecompensa(
    schema: string,
    id_cliente: number,
    id_item_recompensa: number,
    observacao?: string
  ): Promise<ResgateResponse> {
    try {
      const response = await apiClientClientes.post<ResgateResponse>(
        `/clientes/${schema}/${id_cliente}/debitar-pontos`,
        {
          id_item_recompensa,
          observacao,
        }
      );
      return response;
    } catch (error: any) {
      const message =
        error?.message ||
        'Não foi possível concluir o resgate. Tente novamente em instantes.';
      throw new Error(message);
    }
  }

  /**
   * Listar extrato de movimentações
   */
  async getExtrato(
    schema: string,
    id_cliente: number,
    filters: ExtratoFilters = {}
  ): Promise<ExtratoResponse> {
    try {
      const params: Record<string, any> = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        order: filters.order || 'desc',
      };

      if (filters.dt_ini) params.dt_ini = filters.dt_ini;
      if (filters.dt_fim) params.dt_fim = filters.dt_fim;
      if (filters.tipo) params.tipo = filters.tipo;
      if (filters.origem) params.origem = filters.origem;

      const response = await apiClientClientes.get<ExtratoResponse>(
        `/clientes/${schema}/${id_cliente}/pontos-movimentacoes`,
        { params }
      );
      return response;
    } catch (error: any) {
      console.warn('⚠️ API indisponível, usando mock');
      return await pontosMovimentacaoMock.getExtrato(schema, id_cliente, filters);
    }
  }

  /**
   * Buscar movimentações por texto
   */
  async buscarPorTexto(
    schema: string,
    id_cliente: number,
    q: string,
    filters: ExtratoFilters = {}
  ): Promise<ExtratoResponse> {
    try {
      const params: Record<string, any> = {
        q,
        page: filters.page || 1,
        limit: filters.limit || 10,
        order: filters.order || 'desc',
      };

      const response = await apiClientClientes.get<ExtratoResponse>(
        `/clientes/${schema}/${id_cliente}/pontos-movimentacoes/buscar-por-texto`,
        { params }
      );
      return response;
    } catch (error: any) {
      console.warn('⚠️ API indisponível, usando mock');
      return await pontosMovimentacaoMock.buscarPorTexto(schema, id_cliente, q, filters);
    }
  }

  /**
   * Atualizar movimentação
   */
  async updateMovimentacao(
    schema: string,
    id_cliente: number,
    id: number,
    data: UpdateMovimentacaoRequest
  ): Promise<ClientePontosMovimentacao> {
    try {
      const response = await apiClientClientes.put<ClientePontosMovimentacao>(
        `/clientes/${schema}/${id_cliente}/pontos-movimentacoes/${id}`,
        data
      );
      return response;
    } catch (error: any) {
      console.warn('⚠️ API indisponível, usando mock');
      return await pontosMovimentacaoMock.updateMovimentacao(schema, id_cliente, id, data);
    }
  }

  /**
   * Estornar movimentação
   */
  async estornarMovimentacao(
    schema: string,
    id_cliente: number,
    id: number
  ): Promise<MovimentacaoResponse> {
    try {
      const response = await apiClientClientes.delete<MovimentacaoResponse>(
        `/clientes/${schema}/${id_cliente}/pontos-movimentacoes/${id}`
      );
      return response;
    } catch (error: any) {
      console.warn('⚠️ API indisponível, usando mock');
      return await pontosMovimentacaoMock.estornarMovimentacao(schema, id_cliente, id);
    }
  }

  /**
   * Obter dados do cliente
   */
  async getCliente(schema: string, id_cliente: number): Promise<Cliente> {
    try {
      const response = await apiClientClientes.get<Cliente>(
        `/clientes/${schema}/${id_cliente}`
      );
      return response;
    } catch (error: any) {
      console.warn('⚠️ API indisponível, usando mock');
      return await pontosMovimentacaoMock.getCliente(schema, id_cliente);
    }
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const pontosMovimentacaoService = new PontosMovimentacaoService();
