// Permission types
export type Permission = {
  id: number;
  nome: string;
  descricao: string | null;
};

export type GrupoUsuario = {
  id: number;
  nome: string;
  descricao: string | null;
  permissoes: Permission[];
};

export type User = {
  id: number;
  nome: string;
  email: string;
  grupos: GrupoUsuario[];
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type AuthResponse = {
  user: User;
  tokens: AuthTokens;
};
