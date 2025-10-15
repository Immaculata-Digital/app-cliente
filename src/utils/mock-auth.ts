// Credenciais temporárias para desenvolvimento
export const MOCK_CREDENTIALS = {
  login: "admin@appclientes.com",
  password: "Admin@2025",
};

export const MOCK_USER = {
  id_usuario: 1,
  nome: "Administrador Demo",
  email: "admin@appclientes.com",
  ativo: true,
  permissoes: {
    dashboard: { visualizar: true, editar: true },
    usuarios: { visualizar: true, editar: true, criar: true, excluir: true },
    clientes: { visualizar: true, editar: true, criar: true, excluir: true },
    relatorios: { visualizar: true, exportar: true },
  },
};

export const MOCK_TOKENS = {
  accessToken: "mock-access-token-" + Date.now(),
  refreshToken: "mock-refresh-token-" + Date.now(),
};

// Valida se as credenciais mockadas estão corretas
export const validateMockCredentials = (login: string, password: string): boolean => {
  return login === MOCK_CREDENTIALS.login && password === MOCK_CREDENTIALS.password;
};
