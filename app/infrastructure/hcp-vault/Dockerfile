FROM hashicorp/vault:latest

# Copy configuration
COPY vault-config.hcl /vault/config/vault-config.hcl
COPY init.sh /vault/init.sh

RUN chmod +x /vault/init.sh

# Expose Vault port
EXPOSE 8200

# Set entrypoint
ENTRYPOINT ["/vault/init.sh"]