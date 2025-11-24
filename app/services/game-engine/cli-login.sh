#!/bin/bash

# CLI Login Helper Script
# Usage: ./cli-login.sh [--username USERNAME] [--password PASSWORD]
# This script logs in and saves the token for use with cli-game.sh

AUTH_URL="http://localhost:3001"
TOKEN_FILE="$HOME/.ft_transcendence_cli_token"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

USERNAME=""
PASSWORD=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --username)
            USERNAME="$2"
            shift 2
            ;;
        --password)
            PASSWORD="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [--username USERNAME] [--password PASSWORD]"
            exit 1
            ;;
    esac
done

# Get username if not provided
if [ -z "$USERNAME" ]; then
    read -p "Username: " USERNAME
fi

# Get password if not provided
if [ -z "$PASSWORD" ]; then
    read -sp "Password: " PASSWORD
    echo ""
fi

echo -e "${BLUE}Logging in as $USERNAME...${NC}"

# Login to authentication service
RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

# Check for errors
if echo "$RESPONSE" | grep -q '"error"'; then
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
    echo -e "${RED}Login failed: $ERROR_MSG${NC}"
    exit 1
fi

# Extract token from response
TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    # Try alternative JSON parsing with jq if available
    if command -v jq &> /dev/null; then
        TOKEN=$(echo "$RESPONSE" | jq -r '.tokens.accessToken // empty')
    fi
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Login failed! Could not extract token from response.${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

# Save token to file
echo "$TOKEN" > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"

echo -e "${GREEN}Login successful!${NC}"
echo -e "${GREEN}Token saved to $TOKEN_FILE${NC}"
echo ""
echo "You can now use cli-game.sh without --login option:"
echo "  ./cli-game.sh <game-id>"

