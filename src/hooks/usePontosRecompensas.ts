/**
 * Hook para gerenciar recompensas de pontos
 */

import { useState, useCallback } from 'react';
import { pontosRecompensasService } from '@/services/api-clientes';
import type { PontosRecompensasResponse } from '@/types/cliente-pontos-recompensas';

interface UsePontosRecompensasProps {
  schema: string;
  id_cliente: number;
}

export function usePontosRecompensas({ schema, id_cliente }: UsePontosRecompensasProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recompensas, setRecompensas] = useState<PontosRecompensasResponse | null>(null);

  /**
   * Buscar catálogo de recompensas
   */
  const fetchRecompensas = useCallback(async (): Promise<PontosRecompensasResponse | undefined> => {
    if (!id_cliente || id_cliente === 0) {
      const errorMessage = 'Usuário não autenticado. Faça login para acessar as recompensas.';
      setError(errorMessage);
      console.error('[usePontosRecompensas] Erro:', errorMessage);
      return undefined;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[usePontosRecompensas] Iniciando busca de recompensas:', { schema, id_cliente });
      const response = await pontosRecompensasService.getRecompensas(schema, id_cliente);
      console.log('[usePontosRecompensas] Resposta recebida:', response);
      
      if (!response) {
        throw new Error('Resposta vazia do serviço de recompensas');
      }
      
      setRecompensas(response);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao buscar recompensas';
      setError(errorMessage);
      console.error('[usePontosRecompensas] Erro ao buscar recompensas:', err);
      
      // Define uma resposta vazia para não quebrar a UI
      const emptyResponse: PontosRecompensasResponse = {
        quantidade_pontos: 0,
        codigo_cliente: `CLI-${id_cliente}`,
        recompensas: [],
      };
      setRecompensas(emptyResponse);
      return emptyResponse;
    } finally {
      setLoading(false);
    }
  }, [schema, id_cliente]);

  return {
    loading,
    error,
    recompensas,
    fetchRecompensas,
  };
}
