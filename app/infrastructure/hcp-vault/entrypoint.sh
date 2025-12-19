#!/bin/sh

set -e

# Start Vault server in the background
vault server -config=/vault/config/vault-config.hcl &
VAULT_PID=$!

# Wait for Vault to be ready
sleep 5

export VAULT_ADDR='http://127.0.0.1:8200'

# Check if Vault is already initialized
if vault status 2>&1 | grep -q "Sealed.*true"; then
    echo "Vault is sealed but initialized. Please unseal manually."
elif vault status 2>&1 | grep -q "Initialized.*false"; then
    echo "Initializing Vault..."

    # Initialize Vault (1 key share, 1 key threshold for dev)
    vault operator init -key-shares=1 -key-threshold=1 > /vault/data/init-keys.txt

    echo "Vault initialized. Keys saved to /vault/data/init-keys.txt"

    # Extract unseal key and root token
    UNSEAL_KEY=$(grep 'Unseal Key 1:' /vault/data/init-keys.txt | awk '{print $4}')
    ROOT_TOKEN=$(grep 'Initial Root Token:' /vault/data/init-keys.txt | awk '{print $4}')

    # Unseal Vault
    vault operator unseal "$UNSEAL_KEY"

    # Login with root token
    vault login "$ROOT_TOKEN"

    # Enable KV v2 secrets engine
    vault secrets enable -version=2 -path=secret kv

    # Create example secrets for authentication service
    vault kv put secret/authentication/jwt \
        secret_key="your-super-secret-jwt-key-change-this" \
        expiry="1h"

    vault kv put secret/authentication/oauth/intra42 \
        client_id="your-intra42-client-id" \
        client_secret="your-intra42-client-secret" \
        callback_url="http://localhost:8080/api/auth/oauth/intra42/callback"

    vault kv put secret/authentication/database \
        connection_string="sqlite:///path/to/db.sqlite"

    echo "Vault setup complete!"
    echo "Root token: $ROOT_TOKEN"
    echo "Unseal key: $UNSEAL_KEY"
fi

# Keep Vault running in foreground
wait $VAULT_PID
