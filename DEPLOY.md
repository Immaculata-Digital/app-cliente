# Guia de Deploy - Variáveis de Ambiente

## ⚠️ IMPORTANTE: Variáveis de Ambiente no Build

O Vite **injeta as variáveis de ambiente no código durante o build**. Isso significa que as variáveis devem estar disponíveis **durante o build do Docker**, não apenas no runtime.

## 🐳 Build do Docker

Ao fazer o build da imagem Docker, você **DEVE** passar todas as variáveis como `--build-arg`:

```bash
docker build \
  --build-arg VITE_API_CLIENTES_URL_HOMOLOG=https://homolog-api-clientes.immaculatadigital.com.br/api \
  --build-arg VITE_API_CLIENTES_URL_MAIN=https://api-clientes.immaculatadigital.com.br/api \
  --build-arg VITE_API_HOMOLOG_CLIENTES_V2_URL=https://homolog-api-clientes.immaculatadigital.com.br/api \
  --build-arg VITE_API_HOMOLOG_CLIENTES_URL=https://homolog-api-clientes.immaculatadigital.com.br/api \
  --build-arg VITE_API_HOMOLOG_ADMIN_V2_URL=https://homolog-api-admin.immaculatadigital.com.br/api \
  --build-arg VITE_API_HOMOLOG_ADMIN_URL=https://homolog-api-admin.immaculatadigital.com.br/api \
  --build-arg VITE_API_HOMOLOG_USUARIOS_V2_URL=https://homolog-api-usuarios.immaculatadigital.com.br/api \
  --build-arg VITE_API_HOMOLOG_USUARIOS_URL=https://homolog-api-usuarios.immaculatadigital.com.br/api \
  -t app-cliente:latest .
```

## 📝 Variáveis Necessárias

### API Clientes (Prioridade)
1. `VITE_API_CLIENTES_URL_HOMOLOG` - URL da API Clientes em homolog
2. `VITE_API_CLIENTES_URL_MAIN` - URL da API Clientes em produção

### Fallback (se as acima não estiverem definidas)
3. `VITE_API_HOMOLOG_CLIENTES_V2_URL` - Fallback para API Clientes V2
4. `VITE_API_HOMOLOG_CLIENTES_URL` - Fallback para API Clientes V1

### Outras APIs
5. `VITE_API_HOMOLOG_ADMIN_V2_URL` - API Admin V2
6. `VITE_API_HOMOLOG_ADMIN_URL` - API Admin V1 (fallback)
7. `VITE_API_HOMOLOG_USUARIOS_V2_URL` - API Usuários V2
8. `VITE_API_HOMOLOG_USUARIOS_URL` - API Usuários V1 (fallback)

## 🔍 Debug

Após o build, você verá no console do navegador (F12) um log mostrando qual URL está sendo usada:

```
[apiClientClientes] Configuração: {
  VITE_API_CLIENTES_URL_HOMOLOG: "https://..." ou "❌ não definida",
  VITE_API_CLIENTES_URL_MAIN: "https://..." ou "❌ não definida",
  ...
  ✅ baseURL_usado: "https://..."
}
```

Se todas as variáveis aparecerem como "❌ não definida" e o `baseURL_usado` for o fallback padrão, significa que as variáveis não foram passadas corretamente durante o build.

## 🚀 Docker Compose

Se estiver usando Docker Compose, defina as variáveis no arquivo `docker-compose.yml`:

```yaml
services:
  app-cliente:
    build:
      context: .
      args:
        VITE_API_CLIENTES_URL_HOMOLOG: ${VITE_API_CLIENTES_URL_HOMOLOG}
        VITE_API_CLIENTES_URL_MAIN: ${VITE_API_CLIENTES_URL_MAIN}
        VITE_API_HOMOLOG_CLIENTES_V2_URL: ${VITE_API_HOMOLOG_CLIENTES_V2_URL}
        VITE_API_HOMOLOG_CLIENTES_URL: ${VITE_API_HOMOLOG_CLIENTES_URL}
        VITE_API_HOMOLOG_ADMIN_V2_URL: ${VITE_API_HOMOLOG_ADMIN_V2_URL}
        VITE_API_HOMOLOG_ADMIN_URL: ${VITE_API_HOMOLOG_ADMIN_URL}
        VITE_API_HOMOLOG_USUARIOS_V2_URL: ${VITE_API_HOMOLOG_USUARIOS_V2_URL}
        VITE_API_HOMOLOG_USUARIOS_URL: ${VITE_API_HOMOLOG_USUARIOS_URL}
```

E defina as variáveis no arquivo `.env` ou no ambiente:

```bash
export VITE_API_CLIENTES_URL_HOMOLOG=https://homolog-api-clientes.immaculatadigital.com.br/api
export VITE_API_CLIENTES_URL_MAIN=https://api-clientes.immaculatadigital.com.br/api
# ... outras variáveis
```

## ⚡ CI/CD

No seu pipeline de CI/CD (GitHub Actions, GitLab CI, etc.), certifique-se de passar as variáveis durante o build:

```yaml
- name: Build Docker image
  run: |
    docker build \
      --build-arg VITE_API_CLIENTES_URL_HOMOLOG=${{ secrets.VITE_API_CLIENTES_URL_HOMOLOG }} \
      --build-arg VITE_API_CLIENTES_URL_MAIN=${{ secrets.VITE_API_CLIENTES_URL_MAIN }} \
      # ... outras variáveis
      -t app-cliente:latest .
```

## ❌ Problema Comum: "localhost" no Deploy

Se você está vendo `localhost` nas chamadas após o deploy, significa que:

1. **As variáveis não foram passadas durante o build** - Verifique se todos os `--build-arg` estão presentes
2. **As variáveis estão vazias** - Verifique se os valores estão corretos
3. **O build está usando cache antigo** - Faça um build limpo: `docker build --no-cache ...`

## ✅ Solução Rápida

Para garantir que as variáveis estão sendo injetadas:

1. Faça um build limpo: `docker build --no-cache ...`
2. Verifique os logs no console do navegador após o deploy
3. Se ainda aparecer localhost, verifique se todas as variáveis foram passadas como `--build-arg`

