#!/bin/bash

# Debug script to check game state
TOKEN_FILE="$HOME/.ft_transcendence_cli_token"
BASE_URL="http://localhost:3003"
GAME_ID="cli-match"

if [ ! -f "$TOKEN_FILE" ]; then
    echo "❌ No token found. Please login first."
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE" 2>/dev/null)

echo "🔍 Fetching game state..."
echo "Game ID: $GAME_ID"
echo "Token: ${TOKEN:0:50}..."
echo ""

RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)

echo "📋 Full Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Check for specific fields
if echo "$RESPONSE" | grep -q '"ball"'; then
    echo "✅ Ball data found"
    BALL_X=$(echo "$RESPONSE" | jq -r '.ball.x' 2>/dev/null || echo "N/A")
    BALL_Y=$(echo "$RESPONSE" | jq -r '.ball.y' 2>/dev/null || echo "N/A")
    echo "   Ball position: x=$BALL_X, y=$BALL_Y"
else
    echo "❌ No ball data in response"
fi

if echo "$RESPONSE" | grep -q '"paddles"'; then
    echo "✅ Paddles data found"
    LEFT_Y=$(echo "$RESPONSE" | jq -r '.paddles.left.y' 2>/dev/null || echo "N/A")
    RIGHT_Y=$(echo "$RESPONSE" | jq -r '.paddles.right.y' 2>/dev/null || echo "N/A")
    echo "   Left paddle Y: $LEFT_Y"
    echo "   Right paddle Y: $RIGHT_Y"
else
    echo "❌ No paddles data in response"
fi

if echo "$RESPONSE" | grep -q '"score"'; then
    echo "✅ Score data found"
    SCORE_LEFT=$(echo "$RESPONSE" | jq -r '.score.left' 2>/dev/null || echo "N/A")
    SCORE_RIGHT=$(echo "$RESPONSE" | jq -r '.score.right' 2>/dev/null || echo "N/A")
    echo "   Score: Left=$SCORE_LEFT, Right=$SCORE_RIGHT"
else
    echo "❌ No score data in response"
fi

echo ""
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "⚠️  Error in response:"
    echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "$RESPONSE"
fi

