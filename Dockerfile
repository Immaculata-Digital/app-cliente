# Dockerfile - app-clientes (Vite/React) servindo estático via Nginx na porta 7000

# ---------- STAGE 1: BUILD ----------
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- STAGE 2: RUNTIME ----------
FROM nginx:alpine

ARG PORT=7000
ENV PORT=${PORT}

# Copia o build do Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Gera config.js em runtime com variáveis para o front
RUN mkdir -p /docker-entrypoint.d
RUN printf '%s\n' '#!/bin/sh' \
  'cat > /usr/share/nginx/html/config.js < /docker-entrypoint.d/99-generate-config.sh && chmod +x /docker-entrypoint.d/99-generate-config.sh

# Nginx na porta 7000 com fallback SPA
RUN sh -c 'echo "server { \
  listen ${PORT}; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files \$uri /index.html; \
  } \
}" > /etc/nginx/conf.d/default.conf'

EXPOSE 7000
CMD ["nginx", "-g", "daemon off;"]
