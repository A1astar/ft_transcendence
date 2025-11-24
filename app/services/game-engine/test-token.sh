#!/bin/bash

# Quick token test script
TOKEN_FILE="$HOME/.ft_transcendence_cli_token"
BASE_URL="http://localhost:3003"

if [ ! -f "$TOKEN_FILE" ]; then
    echo "❌ No token found. Please login first with: ./cli-pong.sh --login"
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE" 2>/dev/null)

echo "🔍 Testing token..."
echo "Token: ${TOKEN:0:50}..."

# Test game state access
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/game-engine/cli/cli-match" 2>/dev/null)

echo ""
echo "📋 Response:"
echo "$RESPONSE" | head -5

if echo "$RESPONSE" | grep -q '"error":"Unauthorized"'; then
    echo ""
    echo "❌ Token verification failed!"
    echo ""
    echo "💡 Possible causes:"
    echo "   1. Token expired (tokens expire after 15 minutes)"
    echo "   2. JWT_SECRET mismatch between authentication and game-engine services"
    echo ""
    echo "🔧 Solutions:"
    echo "   1. Re-login: ./cli-pong.sh --login --username YOUR_USERNAME --password YOUR_PASSWORD"
    echo "   2. Ensure both services use the same JWT_SECRET environment variable"
    echo "   3. Restart both services with the same JWT_SECRET"
    exit 1
elif echo "$RESPONSE" | grep -q '"ball"'; then
    echo ""
    echo "✅ Token is valid! Game state retrieved successfully."
    exit 0
elif echo "$RESPONSE" | grep -q '"message":"Game not found"'; then
    echo ""
    echo "⚠️  Token is valid, but game not found. Creating game..."
    CREATE_RESPONSE=$(curl -s "$BASE_URL/api/game-engine/cli/create" 2>/dev/null)
    echo "$CREATE_RESPONSE"
    exit 0
else
    echo ""
    echo "⚠️  Unexpected response. Check if game-engine service is running."
    exit 1
fi

