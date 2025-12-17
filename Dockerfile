# ---------- STAGE 1: BUILD ----------
FROM node:18 AS builder
WORKDIR /app

# Manifestos (cache)
COPY package*.json ./

RUN npm ci

# Código e build
COPY . .

# Variáveis de ambiente para build (Vite injeta no código durante o build)
ARG VITE_API_USUARIOS_URL

ENV VITE_API_USUARIOS_URL=$VITE_API_USUARIOS_URL

RUN npm run build

# ---------- STAGE 2: RUNTIME ----------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove arquivos padrão do nginx
RUN rm -rf ./*

# Copia os arquivos buildados
COPY --from=builder /app/dist .

# Configuração do nginx para SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
