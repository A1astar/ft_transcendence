#!/bin/bash

set -e

ELASTIC_URL="${ELASTIC_URL:-http://localhost:9200}"
ELASTIC_USER="${ELASTIC_USER:-elastic}"
ELASTIC_PASSWORD="${ELASTIC_PASSWORD:-changeme}"

echo "Creating ILM policy..."
curl -sS -u "$ELASTIC_USER:$ELASTIC_PASSWORD" \
  -H 'Content-Type: application/json' \
  -X PUT "$ELASTIC_URL/_ilm/policy/logs_policy" \
  --data-binary @$(dirname "$0")/ilm/logs_policy.json

echo "Creating index template..."
curl -sS -u "$ELASTIC_USER:$ELASTIC_PASSWORD" \
  -H 'Content-Type: application/json' \
  -X POST "$ELASTIC_URL/_index_template" \
  --data-binary @$(dirname "$0")/templates/logs_index_template.json

echo "Creating initial write index..."
curl -sS -u "$ELASTIC_USER:$ELASTIC_PASSWORD" \
  -H 'Content-Type: application/json' \
  -X PUT "$ELASTIC_URL/logs-microservices-000001" \
  -d '{
    "aliases": {
      "logs-microservices": {
        "is_write_index": true
      }
    }
  }'