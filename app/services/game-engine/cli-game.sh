#!/bin/bash

# Simple Pong Game Display
# Usage: ./cli-game.sh <game-id>

if [ -z "$1" ]; then
    echo "Usage: $0 <game-id>"
    echo "Example: $0 cli-match"
    exit 1
fi

GAME_ID="$1"
BASE_URL="http://localhost:3003"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
NC='\033[0m'

# Draw game state
draw_game() {
    local game_data="$1"
    
    # Parse game data (improved parsing)
    local score_left=$(echo "$game_data" | jq -r '.score.left' 2>/dev/null || echo "0")
    local score_right=$(echo "$game_data" | jq -r '.score.right' 2>/dev/null || echo "0")
    local ball_x=$(echo "$game_data" | jq -r '.ball.x' 2>/dev/null || echo "0")
    local ball_y=$(echo "$game_data" | jq -r '.ball.y' 2>/dev/null || echo "0")
    local left_paddle_y=$(echo "$game_data" | jq -r '.paddles.left.y' 2>/dev/null || echo "0")
    local right_paddle_y=$(echo "$game_data" | jq -r '.paddles.right.y' 2>/dev/null || echo "0")
    
    # Fallback to grep if jq is not available
    if [ "$ball_x" = "null" ] || [ "$ball_x" = "0" ]; then
        ball_x=$(echo "$game_data" | grep -o '"x":[0-9.-]*' | head -1 | cut -d':' -f2 || echo "0")
        ball_y=$(echo "$game_data" | grep -o '"y":[0-9.-]*' | head -1 | cut -d':' -f2 || echo "0")
        score_left=$(echo "$game_data" | grep -o '"score":\[[0-9]*' | cut -d'[' -f2 || echo "0")
        score_right=$(echo "$game_data" | grep -o '"score":\[[0-9]*,[0-9]*' | cut -d',' -f2 || echo "0")
    fi
    
    # Convert to proper coordinate system
    # Game coordinates: x=(-10 to 10), y=(-5 to 5)
    # Display: 40 cols wide, 20 rows tall
    local display_x=$(echo "$ball_x * 2 + 20" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "20")
    local display_y=$(echo "$ball_y * 2 + 10" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "10")
    
    # Paddle positions (2 units tall in game = 4 chars in display)
    local left_paddle_center=$(echo "$left_paddle_y * 2 + 10" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "10")
    local right_paddle_center=$(echo "$right_paddle_y * 2 + 10" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "10")
    
    # Ensure all values are integers (remove any remaining decimals)
    display_x=$(printf "%.0f" "$display_x" 2>/dev/null || echo "20")
    display_y=$(printf "%.0f" "$display_y" 2>/dev/null || echo "10") 
    left_paddle_center=$(printf "%.0f" "$left_paddle_center" 2>/dev/null || echo "10")
    right_paddle_center=$(printf "%.0f" "$right_paddle_center" 2>/dev/null || echo "10")
    
    # Clamp to bounds
    [ $display_x -lt 1 ] && display_x=1
    [ $display_x -gt 40 ] && display_x=40
    [ $display_y -lt 1 ] && display_y=1
    [ $display_y -gt 20 ] && display_y=20
    
    [ $left_paddle_center -lt 2 ] && left_paddle_center=2
    [ $left_paddle_center -gt 19 ] && left_paddle_center=19
    [ $right_paddle_center -lt 2 ] && right_paddle_center=2
    [ $right_paddle_center -gt 19 ] && right_paddle_center=19
    
    clear
    echo -e "${WHITE}┌─────────────────────────────────────────┐${NC}"
    echo -e "${WHITE}│ ${GREEN}Player 1: $score_left${WHITE} │ ${RED}Player 2: $score_right${WHITE} │${NC}"
    echo -e "${WHITE}├─────────────────────────────────────────┤${NC}"
    
    # Draw game field (20 rows, 40 cols)
    for row in {1..20}; do
        echo -n -e "${WHITE}│${NC}"
        for col in {1..40}; do
            # Left paddle (3 chars tall, centered on paddle position)
            if [ $col -eq 2 ] && [ $row -ge $((left_paddle_center - 1)) ] && [ $row -le $((left_paddle_center + 1)) ]; then
                echo -n -e "${GREEN}█${NC}"
            # Right paddle (3 chars tall, centered on paddle position)
            elif [ $col -eq 39 ] && [ $row -ge $((right_paddle_center - 1)) ] && [ $row -le $((right_paddle_center + 1)) ]; then
                echo -n -e "${RED}█${NC}"
            # Ball
            elif [ $row -eq $display_y ] && [ $col -eq $display_x ]; then
                echo -n -e "${YELLOW}●${NC}"
            else
                echo -n " "
            fi
        done
        echo -e "${WHITE}│${NC}"
    done
    
    echo -e "${WHITE}└─────────────────────────────────────────┘${NC}"
    echo -e "Game ID: $GAME_ID | Ball: ($ball_x, $ball_y) → ($display_x, $display_y)"
}

# Main loop
while true; do
    game_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$game_state" ]; then
        # Check if the API returned a "Game not found" error
        if echo "$game_state" | grep -q '"message":"Game not found"'; then
            echo "Error: Game '$GAME_ID' not found."
            echo "The game may have ended or the Game ID is incorrect."
            exit 1
        fi
        
        # Check if we got valid game data (has ball coordinates)
        if echo "$game_state" | grep -q '"ball"'; then
            draw_game "$game_state"
        else
            echo "Error: Invalid game data received for ID: $GAME_ID"
            echo "Response: $game_state"
            exit 1
        fi
    else
        echo "Error: Cannot connect to game server at $BASE_URL"
        echo "Make sure the game-engine service is running on port 3003"
        exit 1
    fi
    
    sleep 0.5  # Update every 500ms
done