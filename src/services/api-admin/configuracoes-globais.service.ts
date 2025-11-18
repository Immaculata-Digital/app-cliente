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
   * Lista configurações do schema
   */
  async getConfiguracoes(schema: string): Promise<ConfiguracoesGlobais[]> {
    const response = await apiClientAdmin.get<ConfiguracoesGlobaisResponse>(`/${schema}/configuracoes-globais`);
    return response.itens || [];
  }

  /**
   * Busca configuração por ID
   */
  async getConfiguracaoById(schema: string, id: number): Promise<ConfiguracoesGlobais> {
    return await apiClientAdmin.get<ConfiguracoesGlobais>(`/${schema}/configuracoes-globais/${id}`);
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
