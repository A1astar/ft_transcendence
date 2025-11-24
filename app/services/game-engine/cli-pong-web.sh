#!/bin/bash

# Interactive Pong Game CLI - Play against Web Users
# Usage: ./cli-pong-web.sh
# Features:
#   - Login to web application
#   - Match with web players
#   - Real-time gameplay

# Configuration
AUTH_URL="http://localhost:3001"
ORCHESTRATION_URL="http://localhost:3002"
GAME_ENGINE_URL="http://localhost:3003"
TOKEN_FILE="$HOME/.pong-cli-token"
USER_FILE="$HOME/.pong-cli-user"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Token management
ACCESS_TOKEN=""
USER_ID=""
USER_NAME=""
USER_EMAIL=""

# Load saved token and user info
load_credentials() {
    if [ -f "$TOKEN_FILE" ]; then
        ACCESS_TOKEN=$(cat "$TOKEN_FILE")
    fi
    if [ -f "$USER_FILE" ]; then
        USER_NAME=$(cat "$USER_FILE")
    fi
}

# Save token and user info
save_credentials() {
    echo "$ACCESS_TOKEN" > "$TOKEN_FILE"
    echo "$USER_NAME" > "$USER_FILE"
}

# Clear credentials
clear_credentials() {
    rm -f "$TOKEN_FILE" "$USER_FILE"
    ACCESS_TOKEN=""
    USER_ID=""
    USER_NAME=""
    USER_EMAIL=""
}

# Login function
login() {
    echo -e "${CYAN}=== Pong CLI Login ===${NC}"
    echo ""
    
    echo -n "Username or Email: "
    read username_or_email
    
    echo -n "Password: "
    read -s password
    echo ""
    
    echo -e "${YELLOW}Logging in...${NC}"
    
    # Call login API
    response=$(curl -s -X POST "$AUTH_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$username_or_email\",\"password\":\"$password\"}")
    
    # Check if login was successful
    if echo "$response" | grep -q '"success":true'; then
        # Extract token and user info
        ACCESS_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
        USER_ID=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
        USER_NAME=$(echo "$response" | grep -o '"name":"[^"]*' | cut -d'"' -f4)
        USER_EMAIL=$(echo "$response" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
        
        if [ -z "$ACCESS_TOKEN" ]; then
            echo -e "${RED}Failed to extract access token${NC}"
            return 1
        fi
        
        save_credentials
        echo -e "${GREEN}Login successful!${NC}"
        echo -e "${WHITE}Welcome, ${CYAN}$USER_NAME${WHITE}!${NC}"
        return 0
    else
        error=$(echo "$response" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
        echo -e "${RED}Login failed: ${error:-Unknown error}${NC}"
        return 1
    fi
}

# Check if user is logged in
check_auth() {
    if [ -z "$ACCESS_TOKEN" ]; then
        return 1
    fi
    
    # Test token by calling a protected endpoint (optional)
    return 0
}

# Join match queue to play against web users
join_match_queue() {
    if [ -z "$ACCESS_TOKEN" ] || [ -z "$USER_NAME" ]; then
        echo -e "${RED}Not logged in. Please login first.${NC}"
        return 1
    fi
    
    echo -e "${CYAN}Joining match queue to find web players...${NC}"
    
    # Join remote2 queue
    response=$(curl -s -X POST "$ORCHESTRATION_URL/api/game-orchestration/remote2" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "{\"player\":{\"id\":\"$USER_ID\",\"alias\":\"$USER_NAME\"}}")
    
    echo "$response" | grep -q '"status":"waiting"'
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}Waiting for opponent...${NC}"
        poll_match_status
        return 0
    elif echo "$response" | grep -q '"id"'; then
        # Match found immediately
        GAME_ID=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo -e "${GREEN}Match found! Game ID: $GAME_ID${NC}"
        return 0
    else
        error=$(echo "$response" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
        echo -e "${RED}Failed to join queue: ${error:-Unknown error}${NC}"
        return 1
    fi
}

# Poll match status
poll_match_status() {
    echo -e "${YELLOW}Polling for match status...${NC}"
    local attempts=0
    local max_attempts=60  # 60 seconds timeout
    
    while [ $attempts -lt $max_attempts ]; do
        response=$(curl -s "$ORCHESTRATION_URL/api/game-orchestration/remote2/status?alias=$USER_NAME" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if echo "$response" | grep -q '"id"'; then
            # Match found
            GAME_ID=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
            echo -e "${GREEN}Match found! Game ID: $GAME_ID${NC}"
            return 0
        fi
        
        if echo "$response" | grep -q '"status":"waiting"'; then
            printf "."
            sleep 1
            attempts=$((attempts + 1))
        else
            echo -e "${RED}Unexpected response: $response${NC}"
            return 1
        fi
    done
    
    echo -e "\n${RED}Timeout waiting for match${NC}"
    return 1
}

# Send movement command with authentication
send_move() {
    local action="$1"
    curl -s "$GAME_ENGINE_URL/api/game-engine/cli/$GAME_ID/move/$action" \
        -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null 2>&1
}

# Stop all movements
stop_movement() {
    send_move "stop-all"
}

# Draw game state
draw_game() {
    local game_data="$1"
    
    # Parse game data
    local score_left=$(echo "$game_data" | grep -o '"left":[0-9]*' | cut -d':' -f2 || echo "0")
    local score_right=$(echo "$game_data" | grep -o '"right":[0-9]*' | cut -d':' -f2 || echo "0")
    local ball_x=$(echo "$game_data" | grep -o '"x":[-0-9.]*' | head -1 | cut -d':' -f2 || echo "0")
    local ball_y=$(echo "$game_data" | grep -o '"y":[-0-9.]*' | head -1 | cut -d':' -f2 || echo "0")
    local left_paddle_y=$(echo "$game_data" | grep -o '"left":{"y":[-0-9.]*' | cut -d':' -f3 || echo "0")
    local right_paddle_y=$(echo "$game_data" | grep -o '"right":{"y":[-0-9.]*' | cut -d':' -f3 || echo "0")
    
    # Convert to display coordinates
    local display_x=$(echo "scale=0; ($ball_x + 10) * 3" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "30")
    local display_y=$(echo "scale=0; ($ball_y + 5) * 2" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "10")
    local left_paddle_center=$(echo "scale=0; ($left_paddle_y + 5) * 2" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "10")
    local right_paddle_center=$(echo "scale=0; ($right_paddle_y + 5) * 2" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "10")
    
    # Clamp to bounds
    [ $display_x -lt 2 ] && display_x=2
    [ $display_x -gt 59 ] && display_x=59
    [ $display_y -lt 1 ] && display_y=1
    [ $display_y -gt 20 ] && display_y=20
    [ $left_paddle_center -lt 2 ] && left_paddle_center=2
    [ $left_paddle_center -gt 19 ] && left_paddle_center=19
    [ $right_paddle_center -lt 2 ] && right_paddle_center=2
    [ $right_paddle_center -gt 19 ] && right_paddle_center=19
    
    clear
    echo -e "${WHITE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${GREEN} You: $score_left ${WHITE}│ ${RED}Opponent: $score_right ${WHITE}│ Game: ${BLUE}$GAME_ID${WHITE} ║${NC}"
    echo -e "${WHITE}╠════════════════════════════════════════════════════════╣${NC}"
    
    # Draw game field
    for row in {1..20}; do
        echo -n -e "${WHITE}║${NC}"
        for col in {2..59}; do
            # Left paddle (you)
            if [ $col -eq 3 ] && [ $row -ge $((left_paddle_center - 2)) ] && [ $row -le $((left_paddle_center + 1)) ]; then
                echo -n -e "${GREEN}█${NC}"
            # Right paddle (opponent)
            elif [ $col -eq 58 ] && [ $row -ge $((right_paddle_center - 2)) ] && [ $row -le $((right_paddle_center + 1)) ]; then
                echo -n -e "${RED}█${NC}"
            # Center line
            elif [ $col -eq 31 ]; then
                echo -n -e "${WHITE}│${NC}"
            # Ball
            elif [ $row -eq $display_y ] && [ $col -eq $display_x ]; then
                echo -n -e "${YELLOW}●${NC}"
            else
                echo -n " "
            fi
        done
        echo -e "${WHITE}║${NC}"
    done
    
    echo -e "${WHITE}╚════════════════════════════════════════════════════════╝${NC}"
    echo -e "${BLUE}Controls:${NC} ${GREEN}W/S${NC} (Up/Down) | ${YELLOW}Q${NC} = Quit"
    echo -e "${CYAN}Playing as: $USER_NAME${NC}"
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    stop_movement
    
    # Leave queue if in queue
    if [ ! -z "$USER_NAME" ]; then
        curl -s -X POST "$ORCHESTRATION_URL/api/game-orchestration/remote2/leave" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -d "{\"player\":{\"id\":\"$USER_ID\",\"alias\":\"$USER_NAME\"}}" > /dev/null 2>&1
    fi
    
    echo -e "${GREEN}Goodbye!${NC}"
    stty sane
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Main execution
main() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║          Pong CLI - Play Against Web Users            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Load saved credentials
    load_credentials
    
    # Check if logged in
    if [ -z "$ACCESS_TOKEN" ] || ! check_auth; then
        echo -e "${YELLOW}Not logged in. Please login first.${NC}"
        if ! login; then
            exit 1
        fi
    else
        echo -e "${GREEN}Already logged in as: $USER_NAME${NC}"
        read -p "Continue with this account? (y/n): " continue_login
        if [ "$continue_login" != "y" ]; then
            clear_credentials
            if ! login; then
                exit 1
            fi
        fi
    fi
    
    echo ""
    echo -e "${CYAN}=== Match Setup ===${NC}"
    echo ""
    
    # Join match queue
    if ! join_match_queue; then
        echo -e "${RED}Failed to join match queue${NC}"
        exit 1
    fi
    
    # Start game loop
    echo -e "${GREEN}Starting game...${NC}"
    sleep 1
    
    # Check dependencies
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl is required but not installed.${NC}"
        exit 1
    fi
    
    # Check if game server is running
    if ! curl -s "$GAME_ENGINE_URL/api/game-engine/cli/$GAME_ID" > /dev/null 2>&1; then
        echo -e "${RED}Error: Cannot connect to game server at $GAME_ENGINE_URL${NC}"
        exit 1
    fi
    
    # Configure terminal for single character input
    stty -icanon -echo min 0 time 0
    
    # Main game loop
    while true; do
        # Get game state
        game_state=$(curl -s "$GAME_ENGINE_URL/api/game-engine/cli/$GAME_ID" \
            -H "Authorization: Bearer $ACCESS_TOKEN" 2>/dev/null)
        
        if [ $? -ne 0 ] || [ -z "$game_state" ]; then
            echo -e "${RED}Error: Cannot connect to game server${NC}"
            cleanup
        fi
        
        # Check for errors
        if echo "$game_state" | grep -q '"message":"Game not found"'; then
            echo -e "${RED}Error: Game '$GAME_ID' not found${NC}"
            cleanup
        fi
        
        # Draw game if we have valid data
        if echo "$game_state" | grep -q '"ball"'; then
            draw_game "$game_state"
        fi
        
        # Read keyboard input (non-blocking)
        if read -t 0.1 -n 1 key 2>/dev/null; then
            case "$key" in
                [wW])
                    send_move "left-up"
                    ;;
                [sS])
                    send_move "left-down"
                    ;;
                [qQ])
                    cleanup
                    ;;
                *)
                    stop_movement
                    ;;
            esac
        fi
        
        # Small delay
        sleep 0.1
    done
}

# Run main function
main

