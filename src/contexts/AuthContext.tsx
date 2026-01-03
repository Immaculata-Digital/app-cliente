import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "@/types/menu";
import { Funcionalidade } from "@/types/funcionalidade";
import { authService } from "@/services/api-usuarios";
import { clienteService } from "@/services/api-clientes";
import Cookies from "js-cookie";
import { getSchemaFromHostname } from "@/utils/schema.utils";

export interface User {
  id: number;
  login: string;
  email: string;
  grupo: string;
  nome?: string;
  clienteId: number | null;
  clienteNome: string | null;
  menus: Menu[];
  funcionalidades: Funcionalidade[];
}

interface LoginResponse {
  user: {
    id: string;
    fullName: string;
    login: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (chave: string) => boolean;
  hasMenu: (chave: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Log de eventos de autenticação (telemetria)
   * @param event - Nome do evento
   * @param data - Dados do evento (senha é sempre removida)
   */
  const logEvent = (event: string, data?: any) => {
    console.log(`[Auth Event] ${event}`, data ? { ...data, password: undefined } : "");
  };

  /**
   * Limpa todos os dados de autenticação
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("access_expires_in");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    Cookies.remove("access_token");
    Cookies.remove("cliente_id");
    Cookies.remove("cliente_nome");
    if (refreshTimer) clearTimeout(refreshTimer);
  }, [refreshTimer]);

  /**
   * [TODO] Agenda refresh automático do token
   * @param expiresIn - Tempo em segundos até o token expirar
   */
  const scheduleRefresh = useCallback(
    (expiresIn: number) => {
      // if (refreshTimer) clearTimeout(refreshTimer);
      // // Agenda refresh 60s antes do token expirar
      // const refreshTime = Math.max((expiresIn - 60) * 1000, 60000);
      // const timer = setTimeout(() => {
      //   refreshSession();
      // }, refreshTime);
      // setRefreshTimer(timer);
    },
    [refreshTimer],
  );

  /**
   * Função interna para realizar login (compartilhada entre login manual e automático)
   */
  const performLogin = useCallback(
    async (loginEmail: string, password: string, rememberMe = false) => {
      logEvent("auth_login_attempt", { login: loginEmail });

      try {
        // 1. Tenta login na API real (API usuarios v2)
        const response = await authService.login({ loginOrEmail: loginEmail, password: password }, rememberMe);
        logEvent("auth_api_success", { login: loginEmail });

        // 2. Buscar dados do cliente na API clientes v2 usando o id do usuário
        const nomeCliente = response.user.fullName ?? response.user.login;
        let clienteId: number | null = null;
        let clienteNomeFinal = nomeCliente;

        try {
          // Buscar cliente por id_usuario no schema padrão
          const schema = getSchemaFromHostname();
          const cliente = await clienteService.getClienteByUsuario(schema, parseInt(response.user.id, 10));
          if (cliente) {
            clienteId = cliente.id_cliente;
            clienteNomeFinal = cliente.nome_completo || nomeCliente;
          }
        } catch (error) {
          console.warn('[AuthContext] Erro ao buscar cliente por usuário:', error);
          // Continua sem clienteId se não encontrar
        }

        const user: User = {
          id: parseInt(response.user.id, 10),
          login: response.user.login,
          email: response.user.email,
          grupo: "", // API v2 não retorna grupo no login
          nome: clienteNomeFinal,
          clienteId: clienteId,
          clienteNome: clienteNomeFinal,
          menus: [],
          funcionalidades: [],
        };

        // 3. Armazena no storage correto
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(user));

        // API v2 usa tokens JWT com expiração padrão de 1 dia (86400 segundos)
        const accessExpiresSec = 86400; // 1 dia em segundos

        sessionStorage.setItem("access_expires_in", String(accessExpiresSec));

        const cookieOptions = {
          expires: 1, // 1 dia
          secure: window.location.protocol === "https:",
          sameSite: "Strict" as const,
        };

        // 4. Armazena tokens em cookies
        Cookies.set("access_token", response.accessToken, cookieOptions);
        storage.setItem("refresh_token", response.refreshToken);

        // 5. Atualiza state
        setUser(user);
        scheduleRefresh(accessExpiresSec);

        logEvent("auth_login_success", { login: loginEmail, userId: user.id });
      } catch (error: any) {
        logEvent("auth_login_error", { login: loginEmail, error: error.message });

        if (
          error.message?.includes("401") ||
          error.message?.includes("Unauthorized") ||
          error.message === "LOGIN_INVALID"
        ) {
          throw new Error("LOGIN_INVALID");
        } else if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
          throw new Error("USER_BLOCKED");
        } else if (error.message?.includes("429")) {
          throw new Error("RATE_LIMIT");
        } else if (error.message?.includes("Network") || error.message?.includes("fetch")) {
          throw new Error("NETWORK_ERROR");
        } else if (error.message?.includes("500")) {
          throw new Error("SERVER_ERROR");
        }

        throw error;
      }
    },
    [scheduleRefresh, clearAuth],
  );

  // Carrega sessão do storage ao iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
        const accessToken = Cookies.get("access_token");

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          // Agenda refresh baseado no tempo de expiração
          const expiresIn = sessionStorage.getItem("access_expires_in");
          if (expiresIn) {
            scheduleRefresh(parseInt(expiresIn));
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
        clearAuth();
        setIsLoading(false);
      }
    };

    loadSession();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Realiza login do usuário
   * @param loginEmail - Email ou login do usuário
   * @param password - Senha do usuário
   * @param rememberMe - Se true, mantém a sessão no localStorage
   * @throws Error com código de erro específico
   */
  const login = useCallback(
    async (loginEmail: string, password: string, rememberMe = false) => {
      await performLogin(loginEmail, password, rememberMe);
    },
    [performLogin],
  );

  /**
   * Realiza logout do usuário e limpa a sessão
   */
  const logout = useCallback(async () => {
    logEvent("auth_logout", { userId: user?.id });

    try {
      await authService.logout();
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [user, clearAuth, navigate]);

  /**
   * Atualiza o access token usando o refresh token
   */
  const refreshSession = useCallback(async () => {
    try {
      logEvent("auth_refresh_attempt", { userId: user?.id });

      await authService.refreshToken();

      const expiresIn = sessionStorage.getItem("access_expires_in");
      if (expiresIn) {
        scheduleRefresh(parseInt(expiresIn));
      }

      logEvent("auth_refresh_success", { userId: user?.id });
    } catch (error) {
      logEvent("auth_refresh_error", { error });
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [user, clearAuth, navigate, scheduleRefresh]);

  /**
   * Verifica se o usuário tem acesso a um menu
   * Se tem acesso ao menu, tem acesso a todas as funcionalidades daquele menu
   */
  const hasMenu = useCallback(
    (chave: string): boolean => {
      if (!user) return false;
      return user.menus.some((m) => m.chave === chave);
    },
    [user],
  );

  /**
   * Verifica se o usuário tem uma funcionalidade específica
   * Por hora, se tem acesso ao menu, tem todas as funcionalidades
   * No futuro, verificará funcionalidades granulares retornadas pelo backend
   */
  const hasPermission = useCallback(
    (chave: string): boolean => {
      if (!user) return false;

      // Verifica se tem a funcionalidade diretamente
      const hasFuncionalidade = user.funcionalidades.some((f) => f.chave === chave);
      if (hasFuncionalidade) return true;

      // Se não tem a funcionalidade específica, verifica se tem acesso ao menu pai
      // Por hora, ter acesso ao menu significa ter todas as funcionalidades
      const funcToMenu: Record<string, string> = {
        "PONTOS-CREDITAR": "GESTAO-CLIENTES",
        "PONTOS-DEBITAR": "GESTAO-CLIENTES",
        "ITENS-RECOMPENSA-CRIAR": "ITENS-RECOMPENSA",
        "ITENS-RECOMPENSA-EDITAR": "ITENS-RECOMPENSA",
        "ITENS-RECOMPENSA-EXCLUIR": "ITENS-RECOMPENSA",
        "LOJAS-CRIAR": "LOJAS",
        "LOJAS-EDITAR": "LOJAS",
        "LOJAS-EXCLUIR": "LOJAS",
      };

      const parentMenu = funcToMenu[chave] || chave;
      return hasMenu(parentMenu);
    },
    [user, hasMenu],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshSession,
        hasPermission,
        hasMenu,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação
 * @throws Error se usado fora do AuthProvider
 * @example
 * ```tsx
 * const { user, login, logout, hasPermission } = useAuth();
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
