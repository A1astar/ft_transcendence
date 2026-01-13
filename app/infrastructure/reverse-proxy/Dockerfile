FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend ./frontend

WORKDIR /app/frontend

RUN rm src/server.ts

# Some setups provide prod.package.json/prod.tsconfig.json; others don't.
# Use prod.* if present; otherwise keep existing package.json/tsconfig.json.
RUN if [ -f prod.package.json ]; then rm -f package.json && mv prod.package.json package.json; fi \
    && if [ -f prod.tsconfig.json ]; then rm -f tsconfig.json && mv prod.tsconfig.json tsconfig.json; fi

RUN npm install && npm run build

RUN rm -rf node_modules

# Runtime: OWASP ModSecurity + CRS (NGINX)
FROM owasp/modsecurity-crs:nginx

# Prepare writable paths and config directories as root
USER root
RUN mkdir -p /var/cache/modsecurity /var/log/modsecurity /etc/nginx/modsec /etc/modsecurity \
    && chmod 0777 /var/cache/modsecurity /var/log/modsecurity \
    && bash -lc 'if [ -d /usr/share/modsecurity-crs ]; then ln -sfn /usr/share/modsecurity-crs /etc/nginx/modsec/crs; \
      elif [ -d /opt/owasp-crs ]; then ln -sfn /opt/owasp-crs /etc/nginx/modsec/crs; \
      elif [ -d /etc/modsecurity/crs ]; then ln -sfn /etc/modsecurity/crs /etc/nginx/modsec/crs; \
      else echo "CRS path not found" >&2; exit 1; fi'

# Switch back to default image user for runtime
USER 101

# Web root for NGINX
WORKDIR /usr/share/nginx/html

# Cleanup default html as root, then copy artifacts with correct ownership
USER root
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder --chown=101:101 /app/frontend/index.html ./
COPY --from=builder --chown=101:101 /app/frontend/dist ./dist
COPY --from=builder --chown=101:101 /app/frontend/styles/output.css ./styles/output.css
COPY --from=builder --chown=101:101 /app/frontend/public ./public

# NGINX config and entrypoint
COPY infrastructure/reverse-proxy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Align NGINX + ModSecurity config
COPY infrastructure/reverse-proxy/config/nginx.conf /etc/nginx/nginx.conf
COPY infrastructure/reverse-proxy/config/modsecurity.conf /etc/modsecurity/modsecurity.conf
COPY infrastructure/reverse-proxy/config/main.conf /etc/nginx/modsec/main.conf
COPY infrastructure/reverse-proxy/config/custom.conf /etc/nginx/modsec/custom.conf

EXPOSE 80 443

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]
