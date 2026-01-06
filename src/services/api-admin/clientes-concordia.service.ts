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
      // Usa o schema fornecido diretamente (sem normalização)
      const normalizedSchema = schema;
      
      console.log('[ClientesConcordiaService] Buscando nome do cliente pelo schema:', normalizedSchema);
      
      const response = await apiClientAdmin.get<{ nome: string }>(
        `/clientes-concordia/schema/${normalizedSchema}`,
        { skipAuth: true } // Endpoint público
      );
      
      console.log('[ClientesConcordiaService] Resposta recebida:', response);
      
      return response?.nome || null;
    } catch (error: any) {
      // Se for 404, o schema não existe - isso é normal e não deve quebrar a aplicação
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn('[ClientesConcordiaService] Schema não encontrado:', schema);
        return null;
      }
      
      console.error('[ClientesConcordiaService] Erro ao buscar nome do cliente:', error);
      return null;
    }
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const clientesConcordiaService = new ClientesConcordiaService();

