FROM hashicorp/vault:1.21

COPY vault-config.hcl /vault/config/vault-config.hcl

COPY entrypoint.sh /vault/entrypoint.sh

RUN chmod +x /vault/entrypoint.sh

EXPOSE 8200

ENTRYPOINT ["/vault/entrypoint.sh"]