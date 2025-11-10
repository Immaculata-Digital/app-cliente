/**
 * Serviço de Recompensas de Pontos - API Clientes
 * 
 * Responsabilidade: Gerenciar catálogo de recompensas disponíveis
 */

import { apiClientClientes } from '../api-client/http-client.factory';
import type { PontosRecompensasResponse } from '@/types/cliente-pontos-recompensas';

/**
 * Serviço de gerenciamento de recompensas
 */
class PontosRecompensasService {
  /**
   * Obter catálogo de recompensas disponíveis
   */
  async getRecompensas(
    schema: string,
    id_usuario: number
  ): Promise<PontosRecompensasResponse> {
    const response = await apiClientClientes.get<PontosRecompensasResponse>(
      `/api/clientes/${schema}/${id_usuario}/pontos-recompensas`
    );
    return response;
  }
}

/**
 * Exporta instância única (Singleton)
 */
export const pontosRecompensasService = new PontosRecompensasService();
