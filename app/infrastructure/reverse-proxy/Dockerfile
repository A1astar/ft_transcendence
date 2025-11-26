FROM node:22-alpine AS builder

WORKDIR /app

# Copy root tsconfig
COPY tsconfig.json .

# Copy frontend
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Remove node_modules to keep the image clean (optional for builder stage but good practice if we were keeping it)
# RUN rm -rf node_modules

FROM nginx:1.29.1-alpine-slim

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built frontend assets from builder stage
COPY --from=builder /app/frontend .

# Copy nginx config
COPY infrastructure/reverse-proxy/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]