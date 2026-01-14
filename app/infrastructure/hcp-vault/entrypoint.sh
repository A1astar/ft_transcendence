#!/bin/sh

set -e

# Files and directories
KEYS_DIR="/vault/keys"
BOOTSTRAP_DIR="/vault/data/bootstrap"
INIT_JSON="$KEYS_DIR/init-keys.json"
ROOT_TOKEN_FILE="$KEYS_DIR/root-token.txt"
UNSEAL_KEY_FILE="$KEYS_DIR/unseal-key.txt"
APPROLE_JSON="$BOOTSTRAP_DIR/approle.json"

mkdir -p "$KEYS_DIR" "$BOOTSTRAP_DIR" /vault/secrets

# Start Vault in background and capture PID
vault server -config=/vault/config/vault-config.hcl &
VAULT_PID=$!

export VAULT_ADDR="https://127.0.0.1:8200"
export VAULT_CACERT="/vault/certs/ca.crt"

# Wait for Vault API to respond
STATUS_JSON=""
for i in $(seq 1 90); do
    STATUS_JSON="$(vault status -format=json 2>/dev/null || true)"
    [ -n "$STATUS_JSON" ] && break
    sleep 1
done

# Parse status
INITD=$(echo "$STATUS_JSON" | sed -n 's/.*"initialized":[[:space:]]*\(true\|false\).*/\1/p')
SEALED=$(echo "$STATUS_JSON" | sed -n 's/.*"sealed":[[:space:]]*\(true\|false\).*/\1/p')

# Initialize if not initialized (1 key, 1 share)
if [ "$INITD" != "true" ]; then
    INIT_OUT_TEXT="$(vault operator init -key-shares=1 -key-threshold=1 2>&1 || true)"
    echo "$INIT_OUT_TEXT" > "$INIT_JSON"

    UNSEAL_KEY="$(echo "$INIT_OUT_TEXT" | awk -F': ' '/Unseal Key 1/ {print $2; exit}')"
    ROOT_TOKEN="$(echo "$INIT_OUT_TEXT" | awk -F': ' '/Initial Root Token/ {print $2; exit}')"

    [ -n "$UNSEAL_KEY" ] && echo "$UNSEAL_KEY" > "$UNSEAL_KEY_FILE"
    [ -n "$ROOT_TOKEN" ] && echo "$ROOT_TOKEN" > "$ROOT_TOKEN_FILE"

    SEALED=true
fi

# Unseal if sealed
if [ "$SEALED" = "true" ]; then
    KEY=""
    # prefer freshly generated key
    if [ -n "$UNSEAL_KEY" ]; then
        KEY="$UNSEAL_KEY";
    fi

    # or persisted key file
    if [ -z "$KEY" ] && [ -r "$UNSEAL_KEY_FILE" ]; then
        KEY="$(cat "$UNSEAL_KEY_FILE")";
    fi

    # or from init snapshot
    if [ -z "$KEY" ] && [ -r "$INIT_JSON" ]; then
        KEY="$(awk -F': ' '/Unseal Key 1/ {print $2; exit}' "$INIT_JSON")"
    fi

    if [ -n "$KEY" ]; then
        vault operator unseal "$KEY" >/dev/null 2>&1 || true
        for i in $(seq 1 30); do
          STATUS_JSON="$(vault status -format=json 2>/dev/null || true)"
          SEALED=$(echo "$STATUS_JSON" | sed -n 's/.*"sealed":[[:space:]]*\(true\|false\).*/\1/p')
          [ "$SEALED" = "false" ] && break
          sleep 1
        done
    else
        echo "[vault] Warning: sealed and unseal key missing; skipping unseal"
    fi
fi

# Root token handling
if [ ! -s "$ROOT_TOKEN_FILE" ] && [ -r "$INIT_JSON" ]; then
    SNAP_TOKEN="$(awk -F': ' '/Initial Root Token/ {print $2; exit}' "$INIT_JSON")"
    [ -n "$SNAP_TOKEN" ] && echo "$SNAP_TOKEN" > "$ROOT_TOKEN_FILE"
fi

if [ -s "$ROOT_TOKEN_FILE" ]; then
    export VAULT_TOKEN="$(cat "$ROOT_TOKEN_FILE")"

    # Enable secrets engines and AppRole (idempotent)
    vault secrets enable -path=secret -version=2 kv >/dev/null 2>&1 || true
    vault auth enable approle >/dev/null 2>&1 || true

    # Least-privilege policy for authentication service
    cat > "$BOOTSTRAP_DIR/auth-policy.hcl" <<EOF
# JWT: read-only
path "secret/data/authentication/jwt" {
  capabilities = ["read"]
}
path "secret/metadata/authentication/jwt" {
  capabilities = ["read", "list"]
}

# Per-user secrets: read/write
path "secret/data/authentication/users/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "secret/metadata/authentication/users/*" {
  capabilities = ["read", "list"]
}

# OAuth config: read-only (seeded by root or dev)
path "secret/data/authentication/oauth/*" {
  capabilities = ["read", "list"]
}
path "secret/metadata/authentication/oauth/*" {
  capabilities = ["read", "list"]
}

# Health
path "secret/data/health" {
  capabilities = ["read", "update"]
}
EOF
    vault policy write auth-policy "$BOOTSTRAP_DIR/auth-policy.hcl" >/dev/null 2>&1 || true

    # Create AppRole bound to the policy
    vault write auth/approle/role/authentication \
      policies="auth-policy" \
      token_ttl="1h" token_max_ttl="4h" >/dev/null 2>&1 || true

    # Read role_id and issue secret_id
    ROLE_ID=$(vault read -field=role_id auth/approle/role/authentication/role-id 2>/dev/null || true)
    SECRET_ID=$(vault write -force -field=secret_id auth/approle/role/authentication/secret-id 2>/dev/null || true)

    # Persist credentials to Docker secrets path
    if [ -n "$ROLE_ID" ]; then
        echo "$ROLE_ID" > /vault/secrets/approle_role_id;
    fi

    if [ -n "$SECRET_ID" ]; then
        echo "$SECRET_ID" > /vault/secrets/approle_secret_id;
    fi

    # Save JSON snapshot for debugging
    if [ -n "$ROLE_ID" ] && [ -n "$SECRET_ID" ]; then
      cat > "$APPROLE_JSON" <<EOF
{
  "role_id": "${ROLE_ID}",
  "secret_id": "${SECRET_ID}"
}
EOF
    fi

    # Bootstrap JWT secret if missing
    EXISTING_JWT=$(vault kv get -field=signing_key secret/authentication/jwt 2>/dev/null || true)
    if [ -z "$EXISTING_JWT" ]; then
        echo "Seeding random HS256 JWT signing key"
        RANDOM_KEY=$(openssl rand -hex 64)
        vault kv put secret/authentication/jwt signing_key="${RANDOM_KEY}" >/dev/null 2>&1 || true
    fi

    # Seed health flag
    vault kv put secret/health check=true >/dev/null 2>&1 || true
else
    echo "Warning: ROOT_TOKEN_FILE missing; skipping bootstrap ops"
fi

# Keep container alive and forward signals to Vault
trap 'kill -TERM "$VAULT_PID"; wait "$VAULT_PID"' INT TERM
wait "$VAULT_PID"
