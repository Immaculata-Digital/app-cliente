import { apiClientClientes } from '../api-client/http-client.factory';

export interface ClienteRegistroData {
  id_loja: number;
  nome_completo: string;
  email: string;
  whatsapp: string;
  cep: string;
  sexo: 'M' | 'F' | 'O';
  aceite_termos: boolean;
  senha: string;
}

export interface ClienteRegistroResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    nome_completo: string;
    email: string;
  };
}

/**
 * Serviço para gerenciar registro de clientes
 */
class ClienteService {
  /**
   * Registra um novo cliente
   */
  async registrar(schema: string, data: ClienteRegistroData): Promise<ClienteRegistroResponse> {
    return await apiClientClientes.post<ClienteRegistroResponse>(
      `/clientes/${schema}`,
      data,
      { skipAuth: true }
    );
  }
}

export const clienteService = new ClienteService();
