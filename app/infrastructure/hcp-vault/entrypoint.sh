#!/bin/sh

set -e

# Container info log
hostname
hostname -i

# Start Vault server in the foreground
vault server -config=/vault/config/vault-config.hcl

vault operator init -format=json > /vault/init-keys.json