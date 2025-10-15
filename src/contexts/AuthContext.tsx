import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { User, AuthTokens } from "@/types/permissions";
import { authService } from "@/services/api-usuarios";
import { apiClient } from "@/services/api-client/api-client.instance";
import { setupInterceptors } from "@/services/api-client/interceptors";
import { validateMockCredentials, MOCK_USER, MOCK_TOKENS } from "@/utils/mock-auth";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    setUser(null);
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.href = "/login";
  };

  useEffect(() => {
    setupInterceptors(apiClient.getInstance(), handleLogout);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = Cookies.get("access_token");
      
      if (accessToken) {
        // Se for token mockado, usar dados mockados
        if (accessToken.startsWith("mock-access-token")) {
          console.log("🔑 Sessão mockada detectada");
          setUser(MOCK_USER as any);
          setIsLoading(false);
          return;
        }

        // Sistema real
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to get user data:", error);
          handleLogout();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (login: string, password: string) => {
    // MOCK AUTH - Sistema temporário para desenvolvimento
    if (validateMockCredentials(login, password)) {
      console.log("🔑 Usando credenciais mockadas para desenvolvimento");
      
      Cookies.set("access_token", MOCK_TOKENS.accessToken, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
      
      Cookies.set("refresh_token", MOCK_TOKENS.refreshToken, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });
      
      setUser(MOCK_USER as any);
      return;
    }

    // Sistema de autenticação real (API externa)
    try {
      const response = await authService.login(login, password);
      
      Cookies.set("access_token", response.tokens.access, {
        expires: 1,
        secure: true,
        sameSite: "strict",
      });
      
      Cookies.set("refresh_token", response.tokens.refresh, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });
      
      setUser(response.user);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout().finally(() => {
      handleLogout();
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Mock user tem todas as permissões
    if (user.email === "admin@appclientes.com") {
      return true;
    }

    const userPermissions = user.grupos?.flatMap(grupo => 
      grupo.permissoes.map(p => p.nome)
    ) || [];

    return userPermissions.includes(permission);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
