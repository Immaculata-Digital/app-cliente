/**
 * Serviço de Clientes Concordia - API Admin
 * 
 * Responsabilidade: Buscar informações de clientes Concordia
 * Usado para obter o nome do cliente pelo schema (para título do site)
 */

import { apiClientAdmin } from '../api-client/http-client.factory';

export interface ClienteConcordiaNome {
  nome: string;
}

/**
 * Serviço de clientes Concordia
 */
class ClientesConcordiaService {
  /**
   * Busca o nome do cliente pelo schema
   * Endpoint público, não precisa de autenticação
   */
  async getNomeBySchema(schema: string): Promise<string | null> {
    try {
      // Converte subdomínios homolog para z_demo
      const normalizedSchema = schema.includes('homolog') ? 'z_demo' : schema;
      
      const response = await apiClientAdmin.get<ClienteConcordiaNome>(
        `/clientes-concordia/schema/${normalizedSchema}/nome`,
        { skipAuth: true } // Endpoint público
      );
      
      return response.nome || null;
    } catch (error) {
      console.error('[ClientesConcordiaService] Erro ao buscar nome do cliente:', error);
      return null;
    }
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const clientesConcordiaService = new ClientesConcordiaService();

