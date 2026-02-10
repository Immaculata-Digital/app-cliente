/**
 * Serviço de Lojas - API Admin V2
 * 
 * Responsabilidade: Gerenciar operações relacionadas a lojas
 */

import { apiClientAdmin } from '../api-client/http-client.factory';

export interface Loja {
  id_loja: number;
  nome_loja: string;
  nome_loja_publico?: string;
  numero_identificador?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  cnpj: string | null;
  endereco_completo?: string;
  ativo?: boolean;
  schema?: string;
}

export interface ListLojasResponse {
  total: number;
  itens: Loja[];
}

/**
 * Serviço de lojas
 */
class LojaService {
  /**
   * Busca uma loja por ID e schema (público - sem autenticação)
   */
  async getLojaById(schema: string, id: number): Promise<Loja | null> {
    try {
      const response = await apiClientAdmin.get<Loja>(
        `/${schema}/lojas/${id}`,
        { skipAuth: true } // Requisição pública, não precisa de token
      );
      return response;
    } catch (error: any) {
      // Se retornar 404, a loja não existe
      if (error?.status === 404 || error?.response?.status === 404) {
        return null;
      }
      // Outros erros são propagados
      throw error;
    }
  }

  /**
   * Verifica se uma loja existe
   * @throws {Error} Se o erro não for 404 (loja não encontrada)
   */
  async lojaExiste(schema: string, id: number): Promise<boolean> {
    try {
      const loja = await this.getLojaById(schema, id);
      return loja !== null;
    } catch (error: any) {
      // Se for 404, retorna false (loja não existe)
      if (error?.status === 404 || error?.response?.status === 404) {
        return false;
      }
      // Se for outro erro, propaga para ser tratado
      console.error('[LojaService] Erro ao verificar se loja existe:', error);
      throw error;
    }
  }

  /**
   * Lista todas as lojas (público - sem autenticação)
   */
  async listLojas(schema: string, filters?: { limit?: number; offset?: number; search?: string }): Promise<ListLojasResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      if (filters?.search) params.append('search', filters.search);
      const query = params.toString();

      const response = await apiClientAdmin.get<ListLojasResponse>(
        `/${schema}/lojas${query ? `?${query}` : ''}`,
        { skipAuth: true } // Requisição pública, não precisa de token
      );
      return response;
    } catch (error: any) {
      console.error('[LojaService] Erro ao listar lojas:', error);
      throw error;
    }
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const lojaService = new LojaService();

