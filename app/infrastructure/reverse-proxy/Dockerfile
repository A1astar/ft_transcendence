FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend ./frontend

WORKDIR /app/frontend

RUN rm src/server.ts

RUN rm package.json && mv prod.package.json package.json \
    && rm tsconfig.json && mv prod.tsconfig.json tsconfig.json

RUN npm install && npm run build

# Remove node_modules to keep the image clean (optional for builder stage but good practice if we were keeping it)
# RUN rm -rf node_modules

FROM nginx:1.29.1-alpine-slim

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built frontend assets from builder stage
COPY --from=builder /app/frontend .

COPY infrastructure/reverse-proxy/entrypoint.sh /usr/bin

RUN apk add --no-cache curl ca-certificates && \
    curl -L -o /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64 && \
    chmod +x /usr/local/bin/mkcert

# RUN chmod u+x /usr/bin/entrypoint.sh

# Copy nginx config
COPY infrastructure/reverse-proxy/config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

# ENTRYPOINT [ "/usr/bin/entrypoint.sh" ]

CMD [ "nginx", "-g", "daemon off;" ]