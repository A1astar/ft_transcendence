#!/bin/bash

# Interactive Pong Game CLI with JWT Authentication
# Usage: ./cli-pong.sh [--login] [--username USERNAME] [--password PASSWORD] [--token TOKEN] [game-id]
# Controls:
#   Player 1 (Left): W = up, S = down
#   Player 2 (Right): Arrow Up = up, Arrow Down = down
#   Q = quit

AUTH_URL="http://localhost:3001"
BASE_URL="http://localhost:3003"
TOKEN_FILE="$HOME/.ft_transcendence_cli_token"

# Parse arguments
LOGIN=false
USERNAME=""
PASSWORD=""
TOKEN=""
GAME_ID=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --login|--long)
            # Support both --login and --long (common typo)
            LOGIN=true
            shift
            ;;
        --username)
            USERNAME="$2"
            shift 2
            ;;
        --password)
            PASSWORD="$2"
            shift 2
            ;;
        --token)
            TOKEN="$2"
            shift 2
            ;;
        --*)
            # Unknown flag, skip it
            echo -e "${YELLOW}Warning: Unknown flag $1, ignoring...${NC}" >&2
            shift
            ;;
        *)
            GAME_ID="$1"
            shift
            ;;
    esac
done

# Default game ID if not provided
if [ -z "$GAME_ID" ]; then
    GAME_ID="cli-match"
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load saved token if exists and no token provided
if [ -z "$TOKEN" ] && [ -f "$TOKEN_FILE" ]; then
    TOKEN=$(cat "$TOKEN_FILE" 2>/dev/null)
    if [ ! -z "$TOKEN" ]; then
        echo -e "${CYAN}Using saved token from $TOKEN_FILE${NC}"
    fi
fi

# Login function
login() {
    if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
        echo -e "${YELLOW}Username and password required for login${NC}"
        if [ -z "$USERNAME" ]; then
            read -p "Username: " USERNAME
        fi
        if [ -z "$PASSWORD" ]; then
            read -sp "Password: " PASSWORD
            echo ""
        fi
    fi

    echo -e "${BLUE}Logging in as $USERNAME...${NC}"
    
    RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
    
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        if command -v jq &> /dev/null; then
            TOKEN=$(echo "$RESPONSE" | jq -r '.tokens.accessToken // empty')
        fi
    fi
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}Login failed!${NC}"
        echo "Response: $RESPONSE"
        exit 1
    fi
    
    echo "$TOKEN" > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"
    echo -e "${GREEN}Login successful!${NC}"
}

# Perform login if requested
if [ "$LOGIN" = true ]; then
    login
fi

# If still no token, try to login
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}No token available. Please login:${NC}"
    LOGIN=true
    login
fi

# Verify token is set
if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: No authentication token available${NC}"
    exit 1
fi

# Track last pressed key for continuous movement
last_key=""

# Check if game exists, if not create it
check_and_create_game() {
    # Authentication temporarily disabled for testing
    local game_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
    
    # Check if game exists
    if echo "$game_state" | grep -q '"error".*"Game not found"' || echo "$game_state" | grep -q '"error".*"not found"'; then
        echo -e "${YELLOW}Game '$GAME_ID' not found. Creating new game...${NC}"
        local create_result=$(curl -s "$BASE_URL/api/game-engine/cli/create" 2>/dev/null)
        
        if echo "$create_result" | grep -q '"status":"success"'; then
            # Update GAME_ID to the created game ID
            local created_id=$(echo "$create_result" | grep -o '"gameId":"[^"]*' | cut -d'"' -f4 || echo "cli-match")
            if [ "$created_id" != "$GAME_ID" ]; then
                echo -e "${CYAN}Game created with ID: $created_id (using this instead of $GAME_ID)${NC}"
                GAME_ID="$created_id"
            fi
            echo -e "${GREEN}Game created successfully!${NC}"
            sleep 2  # Wait for game to initialize
        else
            echo -e "${RED}Failed to create game${NC}"
            echo "$create_result"
            exit 1
        fi
    elif echo "$game_state" | grep -q '"error"'; then
        # Other error, try to create anyway
        echo -e "${YELLOW}Error accessing game, attempting to create new one...${NC}"
        local create_result=$(curl -s "$BASE_URL/api/game-engine/cli/create" 2>/dev/null)
        if echo "$create_result" | grep -q '"status":"success"'; then
            local created_id=$(echo "$create_result" | grep -o '"gameId":"[^"]*' | cut -d'"' -f4 || echo "cli-match")
            GAME_ID="$created_id"
            echo -e "${GREEN}New game created with ID: $GAME_ID${NC}"
            sleep 2
        fi
    else
        echo -e "${GREEN}Game '$GAME_ID' found!${NC}"
    fi
}

# Send movement command (authentication temporarily disabled for testing)
send_move() {
    local action="$1"
    curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID/move/$action" > /dev/null 2>&1
}

# Stop all movements
stop_movement() {
    send_move "stop-all"
}

# Track last pressed key for continuous movement
last_key=""

# Draw game state
draw_game() {
    local game_data="$1"
    
    # Parse game data
    local score_left=$(echo "$game_data" | jq -r '.score.left' 2>/dev/null || echo "0")
    local score_right=$(echo "$game_data" | jq -r '.score.right' 2>/dev/null || echo "0")
    local ball_x=$(echo "$game_data" | jq -r '.ball.x' 2>/dev/null || echo "0")
    local ball_y=$(echo "$game_data" | jq -r '.ball.y' 2>/dev/null || echo "0")
    local left_paddle_y=$(echo "$game_data" | jq -r '.paddles.left.y' 2>/dev/null || echo "0")
    local right_paddle_y=$(echo "$game_data" | jq -r '.paddles.right.y' 2>/dev/null || echo "0")
    
    # Fallback parsing if jq is not available
    if [ "$ball_x" = "null" ] || [ "$ball_x" = "0" ]; then
        ball_x=$(echo "$game_data" | grep -o '"x":[0-9.-]*' | head -1 | cut -d':' -f2 || echo "0")
        ball_y=$(echo "$game_data" | grep -o '"y":[0-9.-]*' | head -1 | cut -d':' -f2 || echo "0")
    fi
    
    # Convert to display coordinates
    # Game coordinates: x=(-10 to 10), y=(-5 to 5)
    # Display: 60 cols wide, 20 rows tall
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
    
    # Use ANSI escape code instead of clear for faster rendering
    echo -ne "\033[H\033[2J"
    echo -e "${WHITE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║${GREEN} Player 1: $score_left ${WHITE}║${RED} Player 2: $score_right ${WHITE}║ Game ID: ${BLUE}$GAME_ID${WHITE} ║${NC}"
    echo -e "${WHITE}╠════════════════════════════════════════════════════════╣${NC}"
    
    # Draw game field (20 rows, 60 cols)
    for row in {1..20}; do
        echo -n -e "${WHITE}║${NC}"
        for col in {2..59}; do
            # Left paddle (4 chars tall)
            if [ $col -eq 3 ] && [ $row -ge $((left_paddle_center - 2)) ] && [ $row -le $((left_paddle_center + 1)) ]; then
                echo -n -e "${GREEN}█${NC}"
            # Right paddle (4 chars tall)
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
    echo -e "${BLUE}Controls:${NC} ${GREEN}W/S${NC} (Left) | ${RED}↑/↓${NC} (Right) | ${YELLOW}Q${NC} = Quit"
    echo -e "${YELLOW}Ball: ($ball_x, $ball_y)${NC} | ${GREEN}Left Paddle: $left_paddle_y${NC} | ${RED}Right Paddle: $right_paddle_y${NC}"
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping game...${NC}"
    stop_movement
    # Restore original terminal settings
    if [ ! -z "$ORIGINAL_STTY" ]; then
        stty "$ORIGINAL_STTY" 2>/dev/null
    else
        stty sane
    fi
    echo -e "${GREEN}Goodbye!${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Check dependencies
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is required but not installed.${NC}"
    exit 1
fi

# Check if game server is running
if ! curl -s "$BASE_URL/api/game-engine/cli/create" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to game server at $BASE_URL${NC}"
    echo -e "${YELLOW}Make sure the game-engine service is running on port 3003${NC}"
    exit 1
fi

# Create game if needed
check_and_create_game

# Game access verification temporarily disabled for testing
# echo -e "${CYAN}Verifying game access...${NC}"
# test_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
# if echo "$test_state" | grep -q '"error":"Unauthorized"'; then
#     echo -e "${RED}Token verification failed!${NC}"
#     exit 1
# fi

# Configure terminal for single character input
# Save original terminal settings
ORIGINAL_STTY=$(stty -g)
stty -icanon -echo min 0 time 0

echo -e "${GREEN}Pong CLI Game Started!${NC}"
echo -e "${CYAN}Initializing game display...${NC}"
sleep 1

# Test if we can get game state immediately (authentication disabled)
test_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
if echo "$test_state" | grep -q '"ball"'; then
    echo -e "${GREEN}Game state retrieved successfully!${NC}"
    draw_game "$test_state"
elif echo "$test_state" | grep -q '"error".*"not found"'; then
    echo -e "${YELLOW}Game not found, creating new game...${NC}"
    check_and_create_game
    sleep 1
    test_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
    if echo "$test_state" | grep -q '"ball"'; then
        draw_game "$test_state"
    else
        echo -e "${YELLOW}Waiting for game to initialize...${NC}"
        echo -e "${CYAN}Response:${NC}"
        echo "$test_state" | head -5
    fi
else
    echo -e "${YELLOW}Waiting for game to initialize...${NC}"
    echo -e "${CYAN}Response preview:${NC}"
    echo "$test_state" | head -5
    echo ""
    echo -e "${YELLOW}Press Q to quit${NC}"
fi
sleep 0.5

# Main game loop
while true; do
    # Get game state (authentication temporarily disabled for testing)
    game_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
    
    if [ $? -ne 0 ] || [ -z "$game_state" ]; then
        echo -e "${RED}Error: Cannot connect to game server${NC}"
        cleanup
    fi
    
    # Authentication check temporarily disabled for testing
    # if echo "$game_state" | grep -q '"error":"Unauthorized"'; then
    #     echo -e "${RED}Authentication failed! Token may be expired.${NC}"
    #     echo -e "${YELLOW}Please login again with --login${NC}"
    #     rm -f "$TOKEN_FILE"
    #     cleanup
    # fi
    
    # Check for errors
    if echo "$game_state" | grep -q '"message":"Game not found"'; then
        echo -e "${RED}Error: Game '$GAME_ID' not found${NC}"
        cleanup
    fi
    
    # Check for forbidden errors
    if echo "$game_state" | grep -q '"message":"Forbidden"'; then
        echo -e "${RED}Error: You are not authorized to access this game.${NC}"
        cleanup
    fi
    
    # Draw game if we have valid data
    if echo "$game_state" | grep -q '"ball"'; then
        # Use ANSI escape code to clear and move cursor to top (faster than clear)
        echo -ne "\033[H\033[2J"
        draw_game "$game_state"
    elif echo "$game_state" | grep -q '"status"'; then
        # Game exists but may not have started yet
        echo -ne "\033[H\033[2J"
        echo -e "${WHITE}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${WHITE}║${GREEN} Game Found: ${BLUE}$GAME_ID${WHITE}                              ║${NC}"
        echo -e "${WHITE}╠════════════════════════════════════════════════════════╣${NC}"
        echo -e "${YELLOW}Waiting for game to start...${NC}"
        echo ""
        echo -e "${CYAN}Game Status:${NC}"
        echo "$game_state" | jq -r '.status, .mode, .gameId' 2>/dev/null || echo "$game_state" | head -5
        echo ""
        echo -e "${WHITE}╚════════════════════════════════════════════════════════╝${NC}"
        echo -e "${BLUE}Controls:${NC} ${GREEN}W/S${NC} (Left) | ${RED}↑/↓${NC} (Right) | ${YELLOW}Q${NC} = Quit"
    else
        # Debug: Show what we received if no valid data
        echo -ne "\033[H\033[2J"
        if [ ! -z "$game_state" ]; then
            echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
            echo -e "${YELLOW}║${WHITE} Debug: Game State Response${YELLOW}                        ║${NC}"
            echo -e "${YELLOW}╠════════════════════════════════════════════════════════╣${NC}"
            echo -e "${CYAN}Raw Response:${NC}"
            echo "$game_state" | head -20
            echo ""
            echo -e "${YELLOW}╠════════════════════════════════════════════════════════╣${NC}"
            echo -e "${YELLOW}║${WHITE} Game ID: ${BLUE}$GAME_ID${WHITE}                                    ${YELLOW}║${NC}"
            echo -e "${YELLOW}║${WHITE} Tip: Run ./debug-game-state.sh for detailed info${YELLOW}     ║${NC}"
            echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
        else
            echo -e "${RED}Error: No game state received${NC}"
            echo -e "${YELLOW}Check if game-engine service is running on port 3003${NC}"
        fi
        echo ""
        echo -e "${BLUE}Controls:${NC} ${GREEN}W/S${NC} (Left) | ${RED}↑/↓${NC} (Right) | ${YELLOW}Q${NC} = Quit"
    fi
    
    # Track key states for continuous movement
    # Read keyboard input (non-blocking)
    if read -t 0.03 -n 1 key 2>/dev/null; then
        case "$key" in
            [wW])
                send_move "left-up"
                last_key="w"
                ;;
            [sS])
                send_move "left-down"
                last_key="s"
                ;;
            $'\x1b')  # ESC sequence for arrow keys
                read -rsn1 -t 0.03 tmp
                if [ "$tmp" = "[" ]; then
                    read -rsn1 -t 0.03 tmp
                    case "$tmp" in
                        A)  # Arrow Up
                            send_move "right-up"
                            last_key="up"
                            ;;
                        B)  # Arrow Down
                            send_move "right-down"
                            last_key="down"
                            ;;
                    esac
                fi
                ;;
            [qQ])
                cleanup
                ;;
        esac
    fi
    
    # Continue sending movement if key was pressed
    # Movement flags persist on server, so we don't need to spam requests
    # But we refresh the movement state periodically to ensure it's maintained
    if [ ! -z "$last_key" ]; then
        # Periodically resend movement command to ensure it stays active
        # This helps if there's any state reset on the server side
        case "$last_key" in
            "w")
                # Only resend every 10 frames to avoid overwhelming the server
                if [ $((RANDOM % 10)) -eq 0 ]; then
                    send_move "left-up" > /dev/null 2>&1
                fi
                ;;
            "s")
                if [ $((RANDOM % 10)) -eq 0 ]; then
                    send_move "left-down" > /dev/null 2>&1
                fi
                ;;
            "up")
                if [ $((RANDOM % 10)) -eq 0 ]; then
                    send_move "right-up" > /dev/null 2>&1
                fi
                ;;
            "down")
                if [ $((RANDOM % 10)) -eq 0 ]; then
                    send_move "right-down" > /dev/null 2>&1
                fi
                ;;
        esac
    fi
    
    # Increased delay to reduce flickering (was 0.03, now 0.1 for smoother display)
    sleep 0.1
done

