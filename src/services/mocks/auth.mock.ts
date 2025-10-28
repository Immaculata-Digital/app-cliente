import { Menu } from "@/types/menu";
import { Funcionalidade } from "@/types/funcionalidade";

/**
 * Interface do usuário mockado
 * Usado para desenvolvimento enquanto o backend não está disponível
 */
interface MockUser {
  id: number;
  login: string;
  senha: string;
  email: string;
  grupo: string;
  nome: string;
  menus: Menu[];
  funcionalidades: Funcionalidade[];
}

/**
 * Usuário padrão para desenvolvimento
 * Login: thiago.lamberti
 * Senha: Thiago@25
 */
const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    login: "thiago.lamberti",
    senha: "Thiago@25",
    email: "thiago.lamberti@immaculatadigital.com.br",
    grupo: "Administrador",
    nome: "Thiago Lamberti",
    menus: [
      { id_menu: 1, titulo: "Dashboard", chave: "DASHBOARD", url: "/dashboard", icone: "layout-dashboard", ordem: 1, dt_cadastro: "2024-01-15T10:30:00Z", usu_cadastro: 1, ativo: true },
      { id_menu: 2, titulo: "Gestão de Clientes", chave: "GESTAO-CLIENTES", url: "/clientes", icone: "user-check", ordem: 2, dt_cadastro: "2024-01-15T10:30:00Z", usu_cadastro: 1, ativo: true },
      { id_menu: 3, titulo: "Itens de Recompensa", chave: "ITENS-RECOMPENSA", url: "/itens-recompensa", icone: "gift", ordem: 3, dt_cadastro: "2024-01-15T10:30:00Z", usu_cadastro: 1, ativo: true },
      { id_menu: 4, titulo: "Lojas", chave: "LOJAS", url: "/lojas", icone: "store", ordem: 4, dt_cadastro: "2024-01-15T10:30:00Z", usu_cadastro: 1, ativo: true },
      { id_menu: 5, titulo: "Gestão de Usuários", chave: "GESTAO-USUARIOS", url: "/usuarios", icone: "users", ordem: 5, dt_cadastro: "2024-01-15T10:30:00Z", usu_cadastro: 1, ativo: true },
      { id_menu: 6, titulo: "Permissões e Grupos", chave: "PERMISSOES-GRUPOS", url: "/grupos-funcionalidades", icone: "shield-check", ordem: 6, dt_cadastro: "2024-01-15T10:30:00Z", usu_cadastro: 1, ativo: true },
      { id_menu: 7, titulo: "Gestão de Funcionalidades", chave: "GESTAO-FUNCIONALIDADES", url: "/funcionalidades", icone: "link-2", ordem: 7, dt_cadastro: "2024-01-15T10:30:00Z", usu_cadastro: 1, ativo: true },
      { id_menu: 8, titulo: "Configurações", chave: "CONFIGURACOES", url: "/configuracoes", icone: "settings", ordem: 8, dt_cadastro: "2024-01-15T10:30:00Z", usu_cadastro: 1, ativo: true },
    ],
    funcionalidades: [
      { chave: "GESTAO-USUARIOS" },
      { chave: "GESTAO-CLIENTES" },
      { chave: "ITENS-RECOMPENSA" },
      { chave: "CONFIGURACOES" },
      { chave: "LOJAS" },
      { chave: "PERMISSOES-GRUPOS" },
      { chave: "GESTAO-FUNCIONALIDADES" },
    ],
  },
];

/**
 * Simula delay de rede (mock)
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock do serviço de autenticação
 */
class AuthMock {
  /**
   * Faz login com credenciais mockadas
   * @param login - Login ou email do usuário
   * @param senha - Senha do usuário
   */
  async login(login: string, senha: string) {
    await delay(500); // Simula latência de rede

    // Busca usuário por login ou email (case insensitive)
    const mockUser = MOCK_USERS.find(
      (u) => u.login.toLowerCase() === login.toLowerCase() || u.email.toLowerCase() === login.toLowerCase()
    );

    if (!mockUser || mockUser.senha !== senha) {
      throw new Error("LOGIN_INVALID");
    }

    // Remove senha da resposta
    const { senha: _, ...userWithoutPassword } = mockUser;

    return {
      user: {
        id: mockUser.id,
        login: mockUser.login,
        email: mockUser.email,
        grupo: mockUser.grupo,
        nome: mockUser.nome,
        menus: mockUser.menus,
        funcionalidades: mockUser.funcionalidades,
      },
      access_token: `mock_token_${mockUser.id}_${Date.now()}`,
      access_expires_in: "900", // 15 minutos
      refresh_token: `mock_refresh_${mockUser.id}_${Date.now()}`,
      refresh_expires_in: "604800", // 7 dias
    };
  }

  /**
   * Faz logout (mock - apenas retorna sucesso)
   */
  async logout() {
    await delay(200);
    return;
  }

  /**
   * Refresh token (mock)
   */
  async refreshToken() {
    await delay(200);
    return {
      accessToken: `mock_token_refreshed_${Date.now()}`,
    };
  }
}

/**
 * Instância singleton do mock de autenticação
 */
export const authMock = new AuthMock();

/**
 * Retorna lista de usuários mockados (sem senhas)
 */
export const getMockUsers = () =>
  MOCK_USERS.map(({ senha, ...user }) => user);
