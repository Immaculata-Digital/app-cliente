import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { User, AuthTokens } from "@/types/permissions";
import { authService } from "@/services/api-usuarios";
import { apiClient } from "@/services/api-client/api-client.instance";
import { setupInterceptors } from "@/services/api-client/interceptors";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    
    Cookies.set("access_token", response.tokens.access, {
      expires: 1, // 1 day
      secure: true,
      sameSite: "strict",
    });
    
    Cookies.set("refresh_token", response.tokens.refresh, {
      expires: 7, // 7 days
      secure: true,
      sameSite: "strict",
    });
    
    setUser(response.user);
  };

  const logout = () => {
    authService.logout().finally(() => {
      handleLogout();
    });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const userPermissions = user.grupos.flatMap(grupo => 
      grupo.permissoes.map(p => p.nome)
    );

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
