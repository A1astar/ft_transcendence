FROM nginx:1.29.1-alpine-slim

LABEL version="1.0"

RUN apk update && apk add --no-cache openssl

WORKDIR /app

RUN mkdir -p /etc/nginx/ssl

COPY frontend ./frontend
# COPY frontend ./frontend

COPY nginx.conf /etc/nginx/nginx.conf

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/inception.key \
    -out /etc/nginx/ssl/inception.crt \
    -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42/OU=42/CN=${DOMAIN_NAME}" \
    -addext "subjectAltName=DNS:transcendence,DNS:localhost,DNS:transcendence"

RUN mkdir -p /var/www/html && \
    chown -R nginx:nginx /var/www/html

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
