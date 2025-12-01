# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json .
COPY frontend/bun.lockb .
RUN npm install
COPY frontend/ .
RUN npm run build

# Estágio 2: Serve
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copia o script de substituição de variáveis
COPY frontend/replace-env.sh /docker-entrypoint.d/40-replace-env.sh
RUN chmod +x /docker-entrypoint.d/40-replace-env.sh
# Copia um arquivo de configuração do Nginx (vamos criar a seguir)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]