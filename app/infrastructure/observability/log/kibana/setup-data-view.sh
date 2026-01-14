#!/bin/bash

set -e

ELASTIC_URL="${ELASTIC_URL:-http://localhost:9200}"
ELASTIC_USER="${ELASTIC_USER:-elastic}"
ELASTIC_PASSWORD="elastic"

echo "Creating logs_reader role..."
curl -sS -u "$ELASTIC_USER:$ELASTIC_PASSWORD" -H "Content-Type: application/json" \
  -X PUT "$ELASTIC_URL/_security/role/logs_reader" -d '{
    "cluster": [],
    "indices": [
      { "names": [ "logs-microservices-*" ], "privileges": [ "read", "view_index_metadata" ] }
    ]
  }'

echo "Creating viewer user..."
curl -sS -u "$ELASTIC_USER:$ELASTIC_PASSWORD" -H "Content-Type: application/json" \
  -X POST "$ELASTIC_URL/_security/user/viewer" -d "{
    \"password\": \"viewer-password\",
    \"roles\": [\"logs_reader\"],
    \"full_name\": \"Logs Viewer\"
  }"