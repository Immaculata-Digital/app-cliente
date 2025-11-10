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
    setLoading(true);
    setError(null);

    try {
      const response = await pontosRecompensasService.getRecompensas(schema, id_cliente);
      setRecompensas(response);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao buscar recompensas';
      setError(errorMessage);
      console.error('Erro ao buscar recompensas:', err);
      return undefined;
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
