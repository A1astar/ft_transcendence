#!/bin/bash

# Interactive Pong Game CLI - Fixed Movement Controls
# Usage: ./cli-pong-fixed.sh [game-id]
# Controls:
#   Player 1 (Left): W = up, S = down
#   Player 2 (Right): Arrow Up = up, Arrow Down = down
#   Q = quit

GAME_ID="${1:-cli-match}"
BASE_URL="http://localhost:3003"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
BLUE='\033[0;34m'
NC='\033[0m'

# Track key states for continuous movement
last_key=""
key_repeat_count=0

# Check if game exists, if not create it
check_and_create_game() {
    local game_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
    
    if echo "$game_state" | grep -q '"message":"Game not found"'; then
        echo -e "${YELLOW}Creating new game: $GAME_ID${NC}"
        local create_result=$(curl -s "$BASE_URL/api/game-engine/cli/create" 2>/dev/null)
        
        if echo "$create_result" | grep -q '"status":"success"'; then
            echo -e "${GREEN}Game created successfully!${NC}"
            sleep 1
        else
            echo -e "${RED}Failed to create game${NC}"
            echo "$create_result"
            exit 1
        fi
    fi
}

# Send movement command
send_move() {
    local action="$1"
    curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID/move/$action" > /dev/null 2>&1
}

# Stop all movements
stop_movement() {
    send_move "stop-all"
    last_key=""
}

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
    echo -e "${WHITE}║${GREEN} Player 1: $score_left ${WHITE}│ ${RED}Player 2: $score_right ${WHITE}│ Game ID: ${BLUE}$GAME_ID${WHITE} ║${NC}"
    echo -e "${WHITE}╠════════════════════════════════════════════════════════╣${NC}"
    
    # Draw game field
    for row in {1..20}; do
        echo -n -e "${WHITE}║${NC}"
        for col in {2..59}; do
            # Left paddle
            if [ $col -eq 3 ] && [ $row -ge $((left_paddle_center - 2)) ] && [ $row -le $((left_paddle_center + 1)) ]; then
                echo -n -e "${GREEN}█${NC}"
            # Right paddle
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
    if [ ! -z "$last_key" ]; then
        echo -e "${CYAN}Last key: $last_key (sending movement...)$NC"
    fi
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping game...${NC}"
    stop_movement
    echo -e "${GREEN}Goodbye!${NC}"
    stty sane
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

# Configure terminal for single character input
stty -icanon -echo min 0 time 0

echo -e "${GREEN}Pong CLI Game Started!${NC}"
echo -e "${YELLOW}Press Q to quit${NC}"
sleep 1

# Main game loop
while true; do
    # Get game state
    game_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
    
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
    
    # Improved keyboard input handling for continuous movement
    # Use a longer timeout to detect key releases
    if read -t 0.05 -n 1 key 2>/dev/null; then
        case "$key" in
            [wW])
                send_move "left-up"
                last_key="w"
                key_repeat_count=0
                ;;
            [sS])
                send_move "left-down"
                last_key="s"
                key_repeat_count=0
                ;;
            $'\x1b')  # ESC sequence for arrow keys
                read -rsn1 -t 0.05 tmp
                if [ "$tmp" = "[" ]; then
                    read -rsn1 -t 0.05 tmp
                    case "$tmp" in
                        A)  # Arrow Up
                            send_move "right-up"
                            last_key="up"
                            key_repeat_count=0
                            ;;
                        B)  # Arrow Down
                            send_move "right-down"
                            last_key="down"
                            key_repeat_count=0
                            ;;
                    esac
                fi
                ;;
            [qQ])
                cleanup
                ;;
            *)
                # Unknown key - clear last_key to stop movement
                if [ ! -z "$last_key" ]; then
                    stop_movement
                fi
                ;;
        esac
    else
        # No key pressed - continue last movement or stop after a delay
        if [ ! -z "$last_key" ]; then
            key_repeat_count=$((key_repeat_count + 1))
            # Continue sending movement command periodically
            if [ $((key_repeat_count % 3)) -eq 0 ]; then
                case "$last_key" in
                    "w")
                        send_move "left-up"
                        ;;
                    "s")
                        send_move "left-down"
                        ;;
                    "up")
                        send_move "right-up"
                        ;;
                    "down")
                        send_move "right-down"
                        ;;
                esac
            fi
            # Stop after 10 cycles without new key input (key released)
            if [ $key_repeat_count -gt 10 ]; then
                stop_movement
            fi
        fi
    fi
    
    # Small delay for responsiveness
    sleep 0.03
done

