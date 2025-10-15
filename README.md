# App Clientes

Sistema de gestão de clientes com design system completo, autenticação JWT e infraestrutura CI/CD.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router v6** - Roteamento
- **TanStack Query** - Gerenciamento de estado assíncrono
- **React Hook Form + Zod** - Formulários e validação
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **Axios** - Cliente HTTP
- **js-cookie** - Gerenciamento de cookies

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ds/             # Design System (Input, TableCard)
│   ├── dashboard/      # Componentes de dashboard (KPICard, SimpleTable)
│   ├── layout/         # Layouts (DashboardLayout, Sidebar, Header)
│   └── ui/             # Componentes shadcn/ui (46+ componentes)
├── contexts/           # React Contexts (AuthContext)
├── hooks/              # Custom hooks (use-mobile, use-toast)
├── pages/              # Páginas/rotas
│   ├── Login.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── Dashboard.tsx
│   ├── DashboardHome.tsx
│   ├── UserProfile.tsx
│   └── NotFound.tsx
├── routes/             # Configuração de rotas (lazy loading)
├── services/           # Serviços de API
│   ├── api-client/    # Cliente HTTP base + Factory + Interceptors
│   └── api-usuarios/  # APIs de autenticação, senha, grupos
├── types/              # TypeScript types (permissions, user, auth)
├── schemas/            # Schemas de validação Zod (auth, password)
└── utils/              # Funções utilitárias (menu permissions)
```

## 🛠️ Setup Local

```bash
# Instalar dependências
npm install

# Copiar .env de exemplo
cp .env.example .env

# Editar variáveis de ambiente
# Configure as URLs das APIs no arquivo .env

# Iniciar dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# API USUARIOS
VITE_API_USUARIOS_URL=https://api-usuarios.seudominio.com.br/api
VITE_API_HOMOLOG_USUARIOS_URL=https://homolog-api-usuarios.seudominio.com.br/api

# API ADMIN
VITE_API_ADMIN_URL=https://api-admin.seudominio.com.br/api
VITE_API_HOMOLOG_ADMIN_URL=https://homolog-api-admin.seudominio.com.br/api

# API CLIENTES
VITE_API_CLIENTES_URL=https://api-clientes.seudominio.com.br/api
VITE_API_HOMOLOG_CLIENTES_URL=https://homolog-api-clientes.seudominio.com.br/api
```

## 🐳 Docker

### Build e Execução Local

```bash
# Build da imagem
docker build -t app-clientes .

# Executar container
docker run -d \
  --name app-clientes \
  -p 7000:7000 \
  -e VITE_API_USUARIOS_URL="https://api.example.com" \
  app-clientes
```

### Deploy Automático (GitHub Actions)

O projeto possui CI/CD configurado no GitHub Actions:

1. **Trigger**: Push na branch `homolog`
2. **Processo**:
   - Checkout do código
   - Deploy via SSH/rsync para o servidor
   - Build da imagem Docker
   - Restart do container com variáveis de ambiente

Para configurar, adicione os seguintes secrets no GitHub:

- `SSH_PRIVATE_KEY` - Chave SSH para acesso ao servidor
- `SERVER_HOST` - IP ou domínio do servidor
- `SERVER_USER` - Usuário SSH
- `API_USUARIOS_URL` - URL da API de usuários
- `API_ADMIN_URL` - URL da API admin
- `API_CLIENTES_URL` - URL da API de clientes

## ✨ Features

### Autenticação
- ✅ Login com JWT (access + refresh tokens)
- ✅ Recuperação de senha via email
- ✅ Redefinição de senha
- ✅ Interceptors HTTP para refresh automático
- ✅ Cookies seguros (httpOnly, secure, sameSite)

### Autorização
- ✅ Sistema de permissões granulares
- ✅ Grupos de usuários
- ✅ Validação de permissões por rota
- ✅ Componente ProtectedRoute

### UI/UX
- ✅ Design System consistente (HSL tokens)
- ✅ Sidebar colapsável
- ✅ Dashboard com KPIs
- ✅ Tabelas responsivas
- ✅ Cards informativos
- ✅ Formulários com validação
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error boundaries (global + por página)
- ✅ Dark mode preparado

### Performance
- ✅ Lazy loading de rotas
- ✅ Code splitting automático
- ✅ Otimização de bundle (Vite)
- ✅ React Query para cache

### DevOps
- ✅ Docker multi-stage build
- ✅ CI/CD com GitHub Actions
- ✅ Deploy automatizado
- ✅ Nginx para serving estático
- ✅ Health checks

## 📝 Convenções de Código

- **Componentes**: PascalCase, functional components com TypeScript
- **Arquivos**: PascalCase para componentes, kebab-case para utilitários
- **Estilos**: Tailwind utility classes, tokens do design system
- **Imports**: Sempre usar alias `@/` para imports absolutos
- **TypeScript**: Strict mode habilitado
- **Commits**: Seguir Conventional Commits (feat, fix, docs, refactor)

## 🎨 Design System

O projeto usa um design system baseado em tokens HSL:

### Cores Principais
- `primary`: Cor principal do sistema
- `secondary`: Cor secundária
- `destructive`: Vermelho para ações destrutivas
- `success`: Verde para sucesso
- `muted`: Cinza para textos secundários

### Tokens Semânticos
Nunca use cores diretas como `bg-blue-500`. Sempre use tokens:

```tsx
// ❌ ERRADO
<div className="bg-blue-500 text-white">

// ✅ CORRETO
<div className="bg-primary text-primary-foreground">
```

### Componentes Reutilizáveis

**Design System (`src/components/ds/`)**:
- `Input` - Input com label e validação
- `TableCard` - Card para tabelas

**Dashboard (`src/components/dashboard/`)**:
- `KPICard` - Card de indicador com ícone
- `SimpleTable` - Tabela simples com estados

**Layout (`src/components/layout/`)**:
- `DashboardLayout` - Layout com sidebar e header
- `AppSidebar` - Sidebar com navegação
- `AppHeader` - Header com perfil de usuário

## 🔧 Troubleshooting

### Erro de autenticação
- Verifique se as URLs das APIs estão corretas no `.env`
- Confirme que os tokens estão sendo salvos nos cookies
- Verifique os interceptors no DevTools

### Erro de build
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente
- Limpe o cache do Vite: `npm run dev -- --force`

### Erro de permissões
- Verifique se o usuário tem os grupos corretos
- Confirme que as permissões estão configuradas no backend

## 📚 Recursos

- [Documentação React](https://react.dev/)
- [Documentação Vite](https://vitejs.dev/)
- [Documentação Tailwind CSS](https://tailwindcss.com/)
- [Documentação shadcn/ui](https://ui.shadcn.com/)
- [Documentação TanStack Query](https://tanstack.com/query/)
- [Documentação React Hook Form](https://react-hook-form.com/)
- [Documentação Zod](https://zod.dev/)

## 📄 Licença

Proprietary - Todos os direitos reservados

## 👥 Equipe

Desenvolvido com ❤️ pela equipe de desenvolvimento.
