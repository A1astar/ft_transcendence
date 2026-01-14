#!/usr/bin/env bash
set -euo pipefail

# Security tests for reverse proxy (ModSecurity) and authentication service.
# Targets local HTTPS gateway.
# Usage:
#    chmod +x ./app/test/script.sh
#    ./app/test/script.sh
# Custom:
#    BASE_URL="https://localhost:8443" AUTH_PREFIX="/auth" ./app/test/script.sh

BASE_URL="${BASE_URL:-https://localhost:8443}"
AUTH_PREFIX="${AUTH_PREFIX:-/auth}"
REGISTER_URL="$BASE_URL$AUTH_PREFIX/register"
LOGIN_URL="$BASE_URL$AUTH_PREFIX/login"
USERINFO_URL="$BASE_URL$AUTH_PREFIX/userinfo"
ENABLE_2FA_URL="$BASE_URL$AUTH_PREFIX/2fa/enable"

COOKIE_JAR="$(mktemp)"
BODY_FILE="/tmp/body.$$"
HDR_FILE="/tmp/headers.$$"
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PASS="S3cureP@ssw0rd!"
TEST_NAME="tester"
PAYLOAD_DIR="$(cd "$(dirname "$0")" && pwd)/payload"

# Colors
DEFAULT="\033[0m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
BOLD_WHITE="\033[1;37m"
BLUE="\033[0;34m"

# Test ID handling
CURRENT_TEST_ID=0
set_test() { CURRENT_TEST_ID="$1"; }

pass() { printf "${BOLD_WHITE}Test [%s] :${DEFAULT} ${GREEN}PASS${DEFAULT} - %s\n" "$CURRENT_TEST_ID" "$1"; }
fail() { printf "${BOLD_WHITE}Test [%s] :${DEFAULT} ${RED}FAIL${DEFAULT} - %s\n" "$CURRENT_TEST_ID" "$1"; }
info() { printf "${BOLD_WHITE}Test [%s] :${DEFAULT} ${BLUE}INFO${DEFAULT} - %s\n" "$CURRENT_TEST_ID" "$1"; }
warn() { printf "${BOLD_WHITE}Test [%s] :${DEFAULT} ${YELLOW}WARN${DEFAULT} - %s\n" "$CURRENT_TEST_ID" "$1"; }

cleanup() {
    rm -f "$COOKIE_JAR" "$BODY_FILE" "$HDR_FILE" 2>/dev/null || true
}
trap cleanup EXIT

post_json() {
    local url="$1"
    local body="$2"
    local ua="${3:-curl}"
    curl -sS -k -o "$BODY_FILE" -D "$HDR_FILE" -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -A "$ua" \
        -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
        -X POST "$url" \
        --data "$body"
}

get_json() {
    local url="$1"
    curl -sS -k -o "$BODY_FILE" -D "$HDR_FILE" -w "%{http_code}" \
        -H "Accept: application/json" \
        -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
        -X GET "$url"
}

check_header() {
    local name="$1"
    if grep -qi "^$name:" "$HDR_FILE"; then
        pass "Header present: $name"
        return 0
    else
        warn "Header missing: $name"
        return 1
    fi
}

trim() {
    # usage: trimmed=$(trim "$var")
    local s="$1"; s="${s##\ }"; s="${s%%\ }"; printf "%s" "$s"
}

send_reg_with_name() {
    local payload="$1"
    local email="p$(date +%s)$$@example.com"
    local body
    body=$(printf '{"email":"%s","password":"%s","name":"%s"}' "$email" "$TEST_PASS" "$payload")
    post_json "$REGISTER_URL" "$body"
}

send_login_with_identifier() {
    # login accepts an identifier (email or username) in the "email" field
    local payload="$1"
    local body
    body=$(printf '{"email":"%s","password":"wrong"}' "$payload")
    post_json "$LOGIN_URL" "$body"
}

run_payload_file() {
    local file="$1"       # path to payload file
    local mode="$2"       # name|identifier
    local limit="${3:-8}" # limit number of payloads to try
    local used=0
    local ok=0
    local waf=0
    local val=0
    local notexp=0

    if [ ! -f "$file" ]; then
        warn "Payload file missing: $file"
        return 1
    fi

    info "Testing payloads from: $file (mode=$mode, limit=$limit)"
    while IFS= read -r line || [ -n "$line" ]; do
        [ "$used" -ge "$limit" ] && break
        # strip comments and whitespace
        line="$(echo "$line" | sed 's/[\r\n]//g')"
        [ -z "$line" ] && continue
        echo "$line" | grep -Eq '^\s*#' && continue
        local payload
        payload="$line"

        local code
        if [ "$mode" = "name" ]; then
            code=$(send_reg_with_name "$payload")
        else
            code=$(send_login_with_identifier "$payload")
        fi

        case "$code" in
            403)
                waf=$((waf+1)); pass "WAF blocked payload (HTTP 403)";;
            400)
                val=$((val+1)); pass "App validation rejected payload (HTTP 400)";;
            401)
                notexp=$((notexp+1)); pass "Not exploitable (HTTP 401)";;
            200|201)
                ok=$((ok+1)); warn "Unexpected acceptance (HTTP $code)"; cat "$BODY_FILE" 2>/dev/null || true;;
            *)
                warn "Unexpected HTTP $code"; cat "$BODY_FILE" 2>/dev/null || true;;
        esac
        used=$((used+1))
        sleep 0.05
    done < "$file"

    info "Summary for $(basename "$file"): used=$used, waf=$waf, validation=$val, not_exploitable=$notexp, accepted=$ok"
}

# 1) Reverse proxy basic headers
set_test 1
info "Checking security headers on $BASE_URL"
code=$(curl -sS -k -o "$BODY_FILE" -D "$HDR_FILE" -w "%{http_code}" "$BASE_URL/")
if [ "$code" = "200" ] || [ "$code" = "304" ]; then
    pass "Base URL reachable (HTTP $code)"
    check_header "Content-Security-Policy" || true
    check_header "X-Frame-Options" || true
    check_header "X-Content-Type-Options" || true
else
    cat "$BODY_FILE" 2>/dev/null || true
    fail "Base URL not reachable (HTTP $code). Ensure reverse proxy is up."
fi

# 2) Baseline registration
set_test 2
info "Registering a normal user: $TEST_EMAIL"
code=$(post_json "$REGISTER_URL" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\",\"name\":\"$TEST_NAME\"}")
if [ "$code" = "201" ]; then
    pass "Registration accepted (HTTP 201)"
else
    cat "$BODY_FILE" 2>/dev/null || true
    fail "Registration failed (HTTP $code). Adjust BASE_URL/AUTH_PREFIX if needed."
fi

# 3) XSS payloads in name
set_test 3
info "Running XSS payloads against registration name"
run_payload_file "$PAYLOAD_DIR/xss/xss-payload-list.txt" name 6

# 4) Generic SQLi payloads (xPlatform)
set_test 4
info "Running xPlatform SQLi payloads against login identifier"
run_payload_file "$PAYLOAD_DIR/sqli/xplatform.txt" identifier 8

# 5) Generic SQLi payloads
set_test 5
info "Running generic SQLi payloads against login identifier"
run_payload_file "$PAYLOAD_DIR/sqli/Generic_SQLI.txt" identifier 8

# 6) Error-based SQLi
set_test 6
info "Running error-based SQLi payloads against login identifier"
run_payload_file "$PAYLOAD_DIR/sqli/Generic_ErrorBased.txt" identifier 6

# 7) UNION SELECT tests
set_test 7
info "Running UNION SELECT SQLi payloads against login identifier"
run_payload_file "$PAYLOAD_DIR/sqli/Generic_UnionSelect.txt" identifier 6

# 8) Blind/boolean tests
set_test 8
info "Running blind/boolean SQLi payloads against login identifier"
run_payload_file "$PAYLOAD_DIR/sqli/GenericBlind.txt" identifier 6

# 9) Time-based tests
set_test 9
info "Running time-based SQLi payloads against login identifier"
run_payload_file "$PAYLOAD_DIR/sqli/Generic_TimeBased.txt" identifier 4

# 10) WAF heuristic: User-Agent 'sqlmap'
set_test 10
info "Testing WAF block with User-Agent 'sqlmap'"
code=$(post_json "$LOGIN_URL" "{\"email\":\"$TEST_EMAIL\",\"password\":\"bad\"}" "sqlmap")
if [ "$code" = "403" ]; then
    pass "WAF blocked suspicious tool UA (HTTP 403)"
else
    cat "$BODY_FILE" 2>/dev/null || true
    warn "WAF did not block sqlmap UA (HTTP $code). Rule may be disabled."
fi

# 11) Rate limiting
set_test 11
info "Testing login rate limiting"
got429=0
for i in $(seq 1 25); do
    code=$(post_json "$LOGIN_URL" "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrong-$i\"}")
    if [ "$code" = "429" ]; then
        got429=1
        pass "Rate limit enforced after $i attempts (HTTP 429)"
        break
    fi
    sleep 0.2
done
if [ "$got429" -ne 1 ]; then
    fail "Rate limiting not observed within 25 attempts"
fi

# 12) Correct login + cookie
set_test 12
info "Logging in with correct credentials"
code=$(post_json "$LOGIN_URL" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")
if [ "$code" = "200" ] && grep -qi "^set-cookie: access_token=" "$HDR_FILE"; then
    pass "Login success and JWT cookie set (HTTP 200)"
else
    cat "$BODY_FILE" 2>/dev/null || true
    fail "Login failed or cookie missing (HTTP $code)"
fi

# 13) Auth-required endpoint
set_test 13
info "Fetching userinfo with auth cookie"
code=$(get_json "$USERINFO_URL")
if [ "$code" = "200" ]; then
    pass "Userinfo accessible (HTTP 200)"
else
    cat "$BODY_FILE" 2>/dev/null || true
    fail "Userinfo not accessible (HTTP $code)"
fi

# 14) Enable 2FA
set_test 14
info "Enabling 2FA"
code=$(post_json "$ENABLE_2FA_URL" "{}")
body=$(cat "$BODY_FILE" 2>/dev/null || echo "")
if [ "$code" = "200" ] && echo "$body" | grep -q '"twoFactorEnabled":true'; then
    pass "2FA enabled (HTTP 200)"
    # 15) 2FA enforcement
    set_test 15
    info "Testing login without 2FA token after enabling 2FA"
    code=$(post_json "$LOGIN_URL" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")
    if [ "$code" = "401" ]; then
        pass "2FA enforced (HTTP 401 without token)"
    else
        cat "$BODY_FILE" 2>/dev/null || true
        fail "2FA not enforced (HTTP $code)"
    fi
else
    warn "2FA enable failed or endpoint not available (HTTP $code). Skipping 2FA enforcement test."
fi

# Final
set_test 16
info "Tests completed."
