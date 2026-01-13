#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost:8443}"

echo "[waf-demo] Base URL: ${BASE_URL}"
echo
echo "[waf-demo] 1) XSS payload in query string (should be blocked by ModSecurity/CRS)"
curl -sk -i "${BASE_URL}/api/auth/userinfo?x=%3Cscript%3Ealert(1)%3C%2Fscript%3E" | head -n 20

echo
echo "[waf-demo] 2) SQLi-ish payload in JSON body (should be blocked by ModSecurity/CRS)"
curl -sk -i \
  -H 'Content-Type: application/json' \
  --data '{"email":"demo@example.com","password":"x'\'' OR 1=1 --"}' \
  "${BASE_URL}/api/auth/login" | head -n 30

echo
echo "[waf-demo] If you see HTTP 403 (or similar) above, WAF blocking is working."
echo "[waf-demo] To inspect audit logs (inside reverse-proxy container): /var/log/modsecurity/audit.log"

