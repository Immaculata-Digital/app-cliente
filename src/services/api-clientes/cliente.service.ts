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

export interface ClienteData {
  id_cliente: number;
  id_usuario: number;
  id_loja: number;
  nome_completo: string;
  email: string;
  whatsapp: string;
  cep: string;
  sexo: 'M' | 'F';
  saldo: number;
  aceite_termos: boolean;
  dt_cadastro: string;
  usu_cadastro: number;
  dt_altera?: string | null;
  usu_altera?: number | null;
}

/**
 * Serviço para gerenciar registro e busca de clientes
 */
class ClienteService {
  /**
   * Busca dados do cliente por ID
   */
  async getCliente(schema: string, id: number): Promise<ClienteData> {
    try {
      console.log('[ClienteService] Buscando cliente:', { schema, id });
      const response = await apiClientClientes.get<ClienteData>(
        `/clientes/${schema}/${id}`
      );
      console.log('[ClienteService] Cliente encontrado:', response);
      return response;
    } catch (error: any) {
      console.error('[ClienteService] Erro ao buscar cliente:', error);
      throw error;
    }
  }

  /**
   * Busca cliente por id_usuario
   */
  async getClienteByUsuario(schema: string, id_usuario: number): Promise<ClienteData | null> {
    try {
      const response = await apiClientClientes.get<ClienteData>(
        `/clientes/${schema}/usuario/${id_usuario}`
      );
      return response;
    } catch (error: any) {
      // Se retornar 404, o cliente não existe
      if (error?.status === 404 || error?.response?.status === 404) {
        return null;
      }
      console.error('[ClienteService] Erro ao buscar cliente por usuário:', error);
      return null;
    }
  }

  /**
   * Registra um novo cliente (rota pública)
   */
  async registrar(schema: string, data: ClienteRegistroData): Promise<ClienteRegistroResponse> {
    // Remove formatação do CEP (remove hífen) - API espera apenas números
    const cepSemFormatacao = data.cep.replace(/\D/g, '');
    
    // Remove formatação do WhatsApp (remove caracteres não numéricos, exceto o +55 inicial)
    const whatsappSemFormatacao = data.whatsapp.replace(/[^\d+]/g, '');
    
    return await apiClientClientes.post<ClienteRegistroResponse>(
      `/clientes/publico/${schema}`,
      {
        id_loja: data.id_loja,
        nome_completo: data.nome_completo,
        email: data.email,
        whatsapp: whatsappSemFormatacao,
        cep: cepSemFormatacao,
        sexo: data.sexo,
        aceite_termos: data.aceite_termos,
        senha: data.senha,
      },
      { skipAuth: true }
    );
  }
}

export const clienteService = new ClienteService();
