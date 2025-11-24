#!/bin/bash

# CLI User Registration Script
# Usage: ./cli-register.sh [--username USERNAME] [--email EMAIL] [--password PASSWORD]

AUTH_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

USERNAME=""
EMAIL=""
PASSWORD=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --username)
            USERNAME="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        --password)
            PASSWORD="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [--username USERNAME] [--email EMAIL] [--password PASSWORD]"
            exit 1
            ;;
    esac
done

# Get username if not provided
if [ -z "$USERNAME" ]; then
    read -p "Username: " USERNAME
fi

# Get email if not provided
if [ -z "$EMAIL" ]; then
    read -p "Email: " EMAIL
fi

# Get password if not provided
if [ -z "$PASSWORD" ]; then
    read -sp "Password (min 8 characters): " PASSWORD
    echo ""
    read -sp "Confirm Password: " PASSWORD_CONFIRM
    echo ""
    
    if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
        echo -e "${RED}Passwords do not match!${NC}"
        exit 1
    fi
    
    if [ ${#PASSWORD} -lt 8 ]; then
        echo -e "${RED}Password must be at least 8 characters long!${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}Registering user: $USERNAME ($EMAIL)...${NC}"

# Register user
RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Check for errors
if echo "$RESPONSE" | grep -q '"error"'; then
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
    echo -e "${RED}Registration failed: $ERROR_MSG${NC}"
    exit 1
fi

# Check for success
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}Registration successful!${NC}"
    echo ""
    echo -e "${BLUE}You can now login with:${NC}"
    echo "  ./cli-login.sh --username $USERNAME --password <your-password>"
    echo ""
    echo -e "${BLUE}Or use the CLI game directly:${NC}"
    echo "  ./cli-pong.sh --login --username $USERNAME --password <your-password>"
else
    echo -e "${RED}Registration failed! Unexpected response.${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

