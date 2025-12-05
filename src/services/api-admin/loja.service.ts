/**
 * Serviço de Lojas - API Admin V2
 * 
 * Responsabilidade: Gerenciar operações relacionadas a lojas
 */

import { apiClientAdmin } from '../api-client/http-client.factory';

export interface Loja {
  id_loja: number;
  nome: string;
  cnpj: string | null;
  ativo: boolean;
  schema: string;
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
   */
  async lojaExiste(schema: string, id: number): Promise<boolean> {
    try {
      const loja = await this.getLojaById(schema, id);
      return loja !== null;
    } catch (error) {
      console.error('[LojaService] Erro ao verificar se loja existe:', error);
      return false;
    }
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const lojaService = new LojaService();

