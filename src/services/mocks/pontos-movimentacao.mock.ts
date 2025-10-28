import {
  ClientePontosMovimentacao,
  CreateMovimentacaoRequest,
  UpdateMovimentacaoRequest,
  MovimentacaoResponse,
  ExtratoResponse,
  ExtratoFilters,
  Cliente,
} from "@/types/cliente-pontos-movimentacao";

/**
 * Cliente mockado
 */
const MOCK_CLIENTE: Cliente = {
  id_cliente: 1,
  codigo: "CLT001234",
  nome: "João Silva",
  email: "joao.silva@example.com",
  telefone: "(11) 98765-4321",
  cpf: "123.456.789-00",
  saldo_pontos: 1250,
  ativo: true,
  dt_cadastro: "2024-01-15T10:30:00Z",
  dt_altera: "2025-01-20T14:00:00Z",
};

/**
 * Movimentações mockadas
 */
const MOCK_MOVIMENTACOES: ClientePontosMovimentacao[] = [
  {
    id_pontos_movimentacao: 1,
    id_cliente: 1,
    tipo: "CREDITO",
    origem: "MANUAL",
    pontos: 500,
    saldo_anterior: 0,
    saldo_novo: 500,
    descricao: "Bônus de boas-vindas",
    observacao: "Crédito inicial",
    status: "CONFIRMADO",
    dt_movimentacao: "2024-01-15T10:30:00Z",
    dt_cadastro: "2024-01-15T10:30:00Z",
    usu_cadastro: 1,
  },
  {
    id_pontos_movimentacao: 2,
    id_cliente: 1,
    tipo: "CREDITO",
    origem: "PROMO",
    pontos: 1000,
    saldo_anterior: 500,
    saldo_novo: 1500,
    descricao: "Promoção de aniversário",
    status: "CONFIRMADO",
    dt_movimentacao: "2024-02-10T15:20:00Z",
    dt_cadastro: "2024-02-10T15:20:00Z",
    usu_cadastro: 1,
  },
  {
    id_pontos_movimentacao: 3,
    id_cliente: 1,
    tipo: "DEBITO",
    origem: "RESGATE",
    pontos: 250,
    saldo_anterior: 1500,
    saldo_novo: 1250,
    descricao: "Resgate: Açaí 500ml",
    id_item_recompensa: 1,
    status: "CONFIRMADO",
    dt_movimentacao: "2024-03-05T11:00:00Z",
    dt_cadastro: "2024-03-05T11:00:00Z",
    usu_cadastro: 2,
  },
];

/**
 * Simula delay de rede
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock do serviço de movimentação de pontos
 */
class PontosMovimentacaoMock {
  private movimentacoes: ClientePontosMovimentacao[] = [...MOCK_MOVIMENTACOES];
  private nextId = 4;

  /**
   * Criar movimentação
   */
  async createMovimentacao(
    schema: string,
    id_cliente: number,
    data: CreateMovimentacaoRequest
  ): Promise<MovimentacaoResponse> {
    await delay(500);

    const saldoAtual = MOCK_CLIENTE.saldo_pontos;

    // Validações
    if (data.tipo === "DEBITO" && data.pontos > saldoAtual) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    if (data.pontos <= 0) {
      throw new Error("INVALID_POINTS");
    }

    // Calcula novo saldo
    const saldoNovo =
      data.tipo === "CREDITO"
        ? saldoAtual + data.pontos
        : saldoAtual - data.pontos;

    // Cria movimentação
    const novaMovimentacao: ClientePontosMovimentacao = {
      id_pontos_movimentacao: this.nextId++,
      id_cliente,
      tipo: data.tipo,
      origem: data.origem,
      pontos: data.pontos,
      saldo_anterior: saldoAtual,
      saldo_novo: saldoNovo,
      descricao: data.descricao,
      observacao: data.observacao,
      id_item_recompensa: data.id_item_recompensa,
      id_loja: data.id_loja,
      status: "PENDENTE",
      dt_movimentacao: new Date().toISOString(),
      dt_cadastro: new Date().toISOString(),
      usu_cadastro: 1,
    };

    this.movimentacoes.unshift(novaMovimentacao);
    MOCK_CLIENTE.saldo_pontos = saldoNovo;

    return {
      movimentacao: novaMovimentacao,
      saldo_atual: saldoNovo,
    };
  }

  /**
   * Listar extrato
   */
  async getExtrato(
    schema: string,
    id_cliente: number,
    filters: ExtratoFilters = {}
  ): Promise<ExtratoResponse> {
    await delay(300);

    let movimentacoesFiltradas = [...this.movimentacoes].filter(
      (m) => m.id_cliente === id_cliente
    );

    // Filtrar por tipo
    if (filters.tipo) {
      movimentacoesFiltradas = movimentacoesFiltradas.filter(
        (m) => m.tipo === filters.tipo
      );
    }

    // Filtrar por origem
    if (filters.origem) {
      movimentacoesFiltradas = movimentacoesFiltradas.filter(
        (m) => m.origem === filters.origem
      );
    }

    // Filtrar por data
    if (filters.dt_ini) {
      movimentacoesFiltradas = movimentacoesFiltradas.filter(
        (m) => m.dt_movimentacao >= filters.dt_ini!
      );
    }

    if (filters.dt_fim) {
      movimentacoesFiltradas = movimentacoesFiltradas.filter(
        (m) => m.dt_movimentacao <= filters.dt_fim!
      );
    }

    // Ordenar
    const order = filters.order || "desc";
    movimentacoesFiltradas.sort((a, b) => {
      const dateA = new Date(a.dt_movimentacao).getTime();
      const dateB = new Date(b.dt_movimentacao).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const total = movimentacoesFiltradas.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    const movimentacoesPaginadas = movimentacoesFiltradas.slice(start, end);

    return {
      movimentacoes: movimentacoesPaginadas,
      saldo_atual: MOCK_CLIENTE.saldo_pontos,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Buscar por texto
   */
  async buscarPorTexto(
    schema: string,
    id_cliente: number,
    q: string,
    filters: ExtratoFilters = {}
  ): Promise<ExtratoResponse> {
    await delay(300);

    const searchTerm = q.toLowerCase();
    let movimentacoesFiltradas = [...this.movimentacoes]
      .filter((m) => m.id_cliente === id_cliente)
      .filter(
        (m) =>
          m.descricao?.toLowerCase().includes(searchTerm) ||
          m.observacao?.toLowerCase().includes(searchTerm) ||
          m.origem.toLowerCase().includes(searchTerm) ||
          m.tipo.toLowerCase().includes(searchTerm)
      );

    // Ordenar
    const order = filters.order || "desc";
    movimentacoesFiltradas.sort((a, b) => {
      const dateA = new Date(a.dt_movimentacao).getTime();
      const dateB = new Date(b.dt_movimentacao).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });

    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const total = movimentacoesFiltradas.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    const movimentacoesPaginadas = movimentacoesFiltradas.slice(start, end);

    return {
      movimentacoes: movimentacoesPaginadas,
      saldo_atual: MOCK_CLIENTE.saldo_pontos,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Atualizar movimentação
   */
  async updateMovimentacao(
    schema: string,
    id_cliente: number,
    id: number,
    data: UpdateMovimentacaoRequest
  ): Promise<ClientePontosMovimentacao> {
    await delay(400);

    const movimentacao = this.movimentacoes.find(
      (m) => m.id_pontos_movimentacao === id && m.id_cliente === id_cliente
    );

    if (!movimentacao) {
      throw new Error("MOVIMENTACAO_NOT_FOUND");
    }

    // Atualiza campos
    if (data.descricao !== undefined) {
      movimentacao.descricao = data.descricao;
    }
    if (data.observacao !== undefined) {
      movimentacao.observacao = data.observacao;
    }
    if (data.status !== undefined) {
      movimentacao.status = data.status;
    }

    movimentacao.dt_altera = new Date().toISOString();
    movimentacao.usu_altera = 1;

    return movimentacao;
  }

  /**
   * Estornar movimentação
   */
  async estornarMovimentacao(
    schema: string,
    id_cliente: number,
    id: number
  ): Promise<MovimentacaoResponse> {
    await delay(400);

    const movimentacao = this.movimentacoes.find(
      (m) => m.id_pontos_movimentacao === id && m.id_cliente === id_cliente
    );

    if (!movimentacao) {
      throw new Error("MOVIMENTACAO_NOT_FOUND");
    }

    if (movimentacao.status === "ESTORNADO") {
      throw new Error("ALREADY_REVERSED");
    }

    // Cria movimentação de estorno
    const tipoEstorno =
      movimentacao.tipo === "CREDITO" ? "DEBITO" : "CREDITO";
    const saldoAtual = MOCK_CLIENTE.saldo_pontos;
    const saldoNovo =
      tipoEstorno === "CREDITO"
        ? saldoAtual + movimentacao.pontos
        : saldoAtual - movimentacao.pontos;

    const estorno: ClientePontosMovimentacao = {
      id_pontos_movimentacao: this.nextId++,
      id_cliente,
      tipo: tipoEstorno,
      origem: "AJUSTE",
      pontos: movimentacao.pontos,
      saldo_anterior: saldoAtual,
      saldo_novo: saldoNovo,
      descricao: `Estorno: ${movimentacao.descricao || "Movimentação"}`,
      observacao: `Estorno da movimentação #${id}`,
      status: "CONFIRMADO",
      dt_movimentacao: new Date().toISOString(),
      dt_cadastro: new Date().toISOString(),
      usu_cadastro: 1,
    };

    this.movimentacoes.unshift(estorno);
    movimentacao.status = "ESTORNADO";
    MOCK_CLIENTE.saldo_pontos = saldoNovo;

    return {
      movimentacao: estorno,
      saldo_atual: saldoNovo,
    };
  }

  /**
   * Obter cliente
   */
  async getCliente(schema: string, id_cliente: number): Promise<Cliente> {
    await delay(200);
    return MOCK_CLIENTE;
  }
}

/**
 * Instância singleton do mock
 */
export const pontosMovimentacaoMock = new PontosMovimentacaoMock();

/**
 * Retorna movimentações mockadas (para desenvolvimento)
 */
export const getMockMovimentacoes = () => [...MOCK_MOVIMENTACOES];

/**
 * Retorna cliente mockado
 */
export const getMockCliente = () => ({ ...MOCK_CLIENTE });
