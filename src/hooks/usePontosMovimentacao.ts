/**
 * Hook para gerenciar movimentações de pontos
 */

import { useState, useCallback } from 'react';
import { pontosMovimentacaoService } from '@/services/api-clientes';
import type {
  CreateMovimentacaoRequest,
  ExtratoResponse,
  ExtratoFilters,
  MovimentacaoResponse,
  Cliente,
} from '@/types/cliente-pontos-movimentacao';

export const usePontosMovimentacao = (schema: string, id_cliente: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extrato, setExtrato] = useState<ExtratoResponse | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  /**
   * Buscar extrato
   */
  const fetchExtrato = useCallback(async (filters?: ExtratoFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await pontosMovimentacaoService.getExtrato(
        schema,
        id_cliente,
        filters
      );
      setExtrato(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao buscar extrato';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [schema, id_cliente]);

  /**
   * Buscar por texto
   */
  const searchExtrato = useCallback(async (q: string, filters?: ExtratoFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await pontosMovimentacaoService.buscarPorTexto(
        schema,
        id_cliente,
        q,
        filters
      );
      setExtrato(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao buscar movimentações';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [schema, id_cliente]);

  /**
   * Criar movimentação
   */
  const createMovimentacao = useCallback(async (
    data: CreateMovimentacaoRequest
  ): Promise<MovimentacaoResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await pontosMovimentacaoService.createMovimentacao(
        schema,
        id_cliente,
        data
      );
      
      // Atualiza extrato após criar
      await fetchExtrato();
      
      return response;
    } catch (err: any) {
      let errorMsg = 'Erro ao criar movimentação';
      
      if (err.message === 'INSUFFICIENT_BALANCE') {
        errorMsg = 'Saldo insuficiente';
      } else if (err.message === 'INVALID_POINTS') {
        errorMsg = 'Quantidade de pontos inválida';
      }
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [schema, id_cliente, fetchExtrato]);

  /**
   * Estornar movimentação
   */
  const estornarMovimentacao = useCallback(async (
    id: number
  ): Promise<MovimentacaoResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await pontosMovimentacaoService.estornarMovimentacao(
        schema,
        id_cliente,
        id
      );
      
      // Atualiza extrato após estornar
      await fetchExtrato();
      
      return response;
    } catch (err: any) {
      let errorMsg = 'Erro ao estornar movimentação';
      
      if (err.message === 'MOVIMENTACAO_NOT_FOUND') {
        errorMsg = 'Movimentação não encontrada';
      } else if (err.message === 'ALREADY_REVERSED') {
        errorMsg = 'Movimentação já estornada';
      }
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [schema, id_cliente, fetchExtrato]);

  /**
   * Buscar dados do cliente
   */
  const fetchCliente = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await pontosMovimentacaoService.getCliente(schema, id_cliente);
      setCliente(response);
      return response;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao buscar dados do cliente';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [schema, id_cliente]);

  return {
    loading,
    error,
    extrato,
    cliente,
    fetchExtrato,
    searchExtrato,
    createMovimentacao,
    estornarMovimentacao,
    fetchCliente,
  };
};
