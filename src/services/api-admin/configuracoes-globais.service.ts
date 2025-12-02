/**
 * Serviço de Configurações Globais - API Admin
 * 
 * Responsabilidade: Gerenciar configurações globais do sistema
 */

import { apiClientAdmin } from '../api-client/http-client.factory';
import type { ConfiguracoesGlobais, UpdateConfiguracoesGlobaisRequest } from '@/types/configuracoes-globais';

interface ConfiguracoesGlobaisResponse {
  itens: ConfiguracoesGlobais[];
  total: number;
}

/**
 * Serviço de configurações globais
 */
class ConfiguracoesGlobaisService {
  /**
   * Lista configurações do schema (público - sem autenticação)
   */
  async getConfiguracoes(schema: string): Promise<ConfiguracoesGlobais[]> {
    const response = await apiClientAdmin.get<ConfiguracoesGlobaisResponse>(
      `/${schema}/configuracoes-globais`,
      { 
        params: { limit: 1, offset: 0 },
        skipAuth: true // Requisição pública, não precisa de token
      }
    );
    return response.itens || [];
  }

  /**
   * Busca a primeira configuração (geralmente única por schema) - público
   */
  async getFirst(schema: string): Promise<ConfiguracoesGlobais | null> {
    try {
      const configs = await this.getConfiguracoes(schema);
      return configs.length > 0 ? configs[0] : null;
    } catch (error) {
      console.error('[ConfiguracoesGlobaisService] Erro ao buscar configurações:', error);
      return null;
    }
  }

  /**
   * Busca configuração por ID (público - sem autenticação)
   */
  async getConfiguracaoById(schema: string, id: number): Promise<ConfiguracoesGlobais> {
    return await apiClientAdmin.get<ConfiguracoesGlobais>(
      `/${schema}/configuracoes-globais/${id}`,
      { skipAuth: true } // Requisição pública, não precisa de token
    );
  }

  /**
   * Atualiza configuração global
   */
  async updateConfiguracao(
    schema: string,
    id: number,
    data: UpdateConfiguracoesGlobaisRequest
  ): Promise<ConfiguracoesGlobais> {
    return await apiClientAdmin.put<ConfiguracoesGlobais>(
      `/${schema}/configuracoes-globais/${id}`,
      data
    );
  }

  /**
   * Cria configuração global
   */
  async createConfiguracao(
    schema: string,
    data: UpdateConfiguracoesGlobaisRequest
  ): Promise<ConfiguracoesGlobais> {
    return await apiClientAdmin.post<ConfiguracoesGlobais>(
      `/${schema}/configuracoes-globais`,
      data
    );
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const configuracoesGlobaisService = new ConfiguracoesGlobaisService();
