#!/bin/sh
set -e

# Directories
KEYS_DIR="/vault/keys"
BOOTSTRAP_DIR="/vault/data/bootstrap"
INIT_JSON="$KEYS_DIR/init-keys.json"
ROOT_TOKEN_FILE="$KEYS_DIR/root-token.txt"
UNSEAL_KEY_FILE="$KEYS_DIR/unseal-key.txt"
APPROLE_JSON="$BOOTSTRAP_DIR/approle.json"
LOG_FILE="/vault/vault.log"

mkdir -p "$KEYS_DIR" "$BOOTSTRAP_DIR"

# Start Vault with TLS config in background
vault server -config=/vault/config/vault-config.hcl > "$LOG_FILE" 2>&1 &

export VAULT_ADDR="https://127.0.0.1:8200"
export VAULT_CACERT="/vault/certs/ca.crt"

# Wait for Vault to respond (any status). Avoid set -e by masking failures.
STATUS_JSON=""
for i in $(seq 1 90); do
    STATUS_JSON=$(vault status -format=json 2>/dev/null || true)
    echo "$STATUS_JSON" | grep -q '"initialized"' && break
    sleep 1
done

# Parse status
INITD=$(echo "$STATUS_JSON" | sed -n 's/.*"initialized":\([^,}]*\).*/\1/p' | tr -d ' ')
SEALED=$(echo "$STATUS_JSON" | sed -n 's/.*"sealed":\([^,}]*\).*/\1/p' | tr -d ' ')

# Initialize only if not initialized
if [ "$INITD" != "true" ]; then
    echo "[vault] Initializing Vault (server mode)"
    vault operator init -key-shares=1 -key-threshold=1 -format=json > "$INIT_JSON"
    ROOT_TOKEN=$(sed -n 's/.*"root_token":"\([^"]*\)".*/\1/p' "$INIT_JSON")
    UNSEAL_KEY=$(sed -n 's/.*"unseal_keys_b64":\["\([^"]*\)"\].*/\1/p' "$INIT_JSON")
    echo "$ROOT_TOKEN" > "$ROOT_TOKEN_FILE"
    echo "$UNSEAL_KEY" > "$UNSEAL_KEY_FILE"
    SEALED=true
fi

# Unseal if sealed and we have the key
if [ "$SEALED" = "true" ]; then
    if [ -r "$UNSEAL_KEY_FILE" ]; then
      UNSEAL_KEY=$(tr -d '\r\n' < "$UNSEAL_KEY_FILE")
    else
      UNSEAL_KEY=""
    fi
    if [ -n "$UNSEAL_KEY" ]; then
      echo "[vault] Unsealing"
      vault operator unseal "$UNSEAL_KEY"
    else
      echo "[vault] Warning: sealed but unseal key missing; skipping unseal"
    fi
fi

# If we have a root token, use it for bootstrap; otherwise skip privileged ops
if [ -s "$ROOT_TOKEN_FILE" ]; then
    export VAULT_TOKEN="$(cat "$ROOT_TOKEN_FILE")"

    # Enable secrets engines and AppRole (idempotent)
    vault secrets enable -path=secret -version=2 kv >/dev/null 2>&1 || true
    vault auth enable approle >/dev/null 2>&1 || true

    # Policy for authentication service
    cat > "$BOOTSTRAP_DIR/auth-policy.hcl" <<POL
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "secret/metadata/*" {
  capabilities = ["read", "list"]
}
POL
    vault policy write auth-policy "$BOOTSTRAP_DIR/auth-policy.hcl" >/dev/null 2>&1 || true

    # Ensure AppRole exists
    vault write auth/approle/role/authentication \
      policies="auth-policy" \
      token_ttl="1h" token_max_ttl="4h" >/dev/null 2>&1 || true

    # Read role_id and create a new secret_id
    ROLE_ID=$(vault read -field=role_id auth/approle/role/authentication/role-id 2>/dev/null || true)
    SECRET_ID=$(vault write -force -field=secret_id auth/approle/role/authentication/secret-id 2>/dev/null || true)

    # Persist into secrets files for Docker secrets if values exist
    if [ -n "$ROLE_ID" ]; then
      echo "$ROLE_ID" > /vault/secrets/approle_role_id
    fi
    if [ -n "$SECRET_ID" ]; then
      echo "$SECRET_ID" > /vault/secrets/approle_secret_id
    fi

    # Also persist a JSON snapshot (optional)
    if [ -n "$ROLE_ID" ] && [ -n "$SECRET_ID" ]; then
      cat > "$APPROLE_JSON" <<JSON
{
  "role_id": "${ROLE_ID}",
  "secret_id": "${SECRET_ID}"
}
JSON
    fi

    # Seed health secret
    vault kv put secret/health check=true >/dev/null 2>&1 || true
else
    echo "[vault] Warning: ROOT_TOKEN_FILE missing; skipping bootstrap ops"
fi

# Keep process alive
exec tail -f "$LOG_FILE"
