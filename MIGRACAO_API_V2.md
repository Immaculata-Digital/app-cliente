# Migração para APIs V2

Este documento descreve as adaptações realizadas no app-cliente para usar as APIs v2.

## Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no arquivo `.env`:

```env
# URLs das APIs V2
# API Admin V2
VITE_API_HOMOLOG_ADMIN_V2_URL=https://homolog-api-admin.immaculatadigital.com.br/api
# Fallback para API Admin V1 (caso necessário)
VITE_API_HOMOLOG_ADMIN_URL=https://homolog-api-admin.immaculatadigital.com.br/api

# API Usuários V2
VITE_API_HOMOLOG_USUARIOS_V2_URL=http://localhost:3333/api
# Fallback para API Usuários V1 (caso necessário)
VITE_API_HOMOLOG_USUARIOS_URL=http://localhost:3333/api

# API Clientes V2
VITE_API_HOMOLOG_CLIENTES_V2_URL=https://homolog-api-clientes.immaculatadigital.com.br/api
# Fallback para API Clientes V1 (caso necessário)
VITE_API_HOMOLOG_CLIENTES_URL=https://homolog-api-clientes.immaculatadigital.com.br/api
```

## Mudanças Realizadas

### 1. HTTP Client Factory (`http-client.factory.ts`)
- ✅ Atualizado para usar URLs das APIs v2
- ✅ Mantém fallback para APIs v1 quando necessário

### 2. Serviço de Autenticação (`auth.service.ts`)
- ✅ Adaptado para usar endpoints da API usuarios v2
- ✅ Formato de login alterado: `{ loginOrEmail, password }` (antes: `{ login, senha }`)
- ✅ Formato de resposta alterado: `{ accessToken, refreshToken, user }` (antes: `{ access_token, refresh_token, user }`)
- ✅ Endpoint de refresh: `/auth/refresh-token` (antes: `/auth/refresh`)

### 3. Serviço de Senha (`password.service.ts`)
- ✅ Adaptado para usar endpoints da API usuarios v2
- ✅ Endpoint de reset: `/clientes/auth/password/reset` com campo `nova_senha` (antes: `novaSenha`)

### 4. Serviço de Cliente (`cliente.service.ts`)
- ✅ Adaptado para usar endpoints da API clientes v2
- ✅ Endpoint de registro: `/clientes/publico/:schema` (mantido)

### 5. Serviço de Pontos e Movimentações (`pontos-movimentacao.service.ts`)
- ⚠️ **Nota**: A API clientes v2 ainda não possui módulos de pontos e movimentações implementados
- ✅ Mantém uso da API clientes v1 para esses endpoints até que a v2 esteja disponível

### 6. Serviço de Recompensas (`pontos-recompensas.service.ts`)
- ✅ Adaptado para usar API admin v2 para buscar itens de recompensa
- ✅ Endpoint: `/:schema/itens-recompensa` (API admin v2)
- ✅ Mantém uso da API clientes v1 para pontos-recompensas do cliente

### 7. Serviço de Configurações Globais (`configuracoes-globais.service.ts`)
- ✅ Já estava usando API admin, agora usa v2
- ✅ Endpoints mantidos: `/:schema/configuracoes-globais`

### 8. AuthContext (`AuthContext.tsx`)
- ✅ Adaptado para usar formato de resposta da API usuarios v2
- ✅ Campos atualizados: `id` (string -> number), `fullName` (antes: `nome_completo`)
- ⚠️ **Nota**: A API usuarios v2 não retorna `id_cliente` no login. Será necessário buscar essa informação em uma chamada separada se necessário.

## Endpoints das APIs V2

### API Usuários V2
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh-token` - Refresh token
- `POST /clientes/auth/password/forgot` - Esqueci minha senha
- `POST /clientes/auth/password/reset` - Reset de senha

### API Clientes V2
- `POST /clientes/publico/:schema` - Registro público de cliente
- `GET /clientes/:schema/:id` - Buscar cliente
- `GET /clientes/:schema/:id/pontos-recompensas` - Pontos e recompensas (ainda na v1)

### API Admin V2
- `GET /:schema/configuracoes-globais` - Listar configurações
- `GET /:schema/itens-recompensa` - Listar itens de recompensa

## Observações Importantes

1. **Pontos e Movimentações**: A API clientes v2 ainda não possui os módulos de pontos e movimentações. Os endpoints continuam usando a API clientes v1 até que a v2 esteja disponível.

2. **ID do Cliente**: A API usuarios v2 não retorna `id_cliente` diretamente no login. Se necessário, será preciso fazer uma chamada adicional para obter essa informação.

3. **Formato de Tokens**: A API usuarios v2 usa tokens JWT com expiração padrão de 1 dia (86400 segundos).

4. **Fallback**: O código mantém fallback para APIs v1 quando as variáveis de ambiente das v2 não estão configuradas.

## Próximos Passos

1. Implementar módulos de pontos e movimentações na API clientes v2
2. Adicionar endpoint para buscar informações do cliente (incluindo id_cliente) na API usuarios v2
3. Testar todas as funcionalidades com as APIs v2
4. Remover fallbacks para APIs v1 quando todas as funcionalidades estiverem migradas

