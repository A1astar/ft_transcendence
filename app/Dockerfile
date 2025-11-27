FROM nginx:1.29.1-alpine-slim

LABEL version="1.0"

RUN apk update && apk add --no-cache openssl

COPY entrypoint.sh /usr/local/bin

WORKDIR /

RUN mkdir -p /etc/nginx/ssl

COPY infrastructure/reverse-proxy/nginx.conf /etc/nginx/nginx.conf

COPY frontend ./frontend

WORKDIR /frontend

COPY *.json ./

RUN chmod u+x /usr/local/bin/entrypoint.sh

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/inception.key \
    -out /etc/nginx/ssl/inception.crt \
    -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42/OU=42/CN=${DOMAIN_NAME}" \
    -addext "subjectAltName=DNS:transcendence,DNS:localhost,DNS:transcendence"

EXPOSE 443

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# CMD ["nginx", "-g", "daemon off;"]
