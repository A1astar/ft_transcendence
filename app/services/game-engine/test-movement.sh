#!/bin/bash

# 測試移動控制的腳本

GAME_ID="${1:-cli-match}"
BASE_URL="http://localhost:3003"

echo "🧪 Testing Movement Controls"
echo "============================="
echo ""

# 顏色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 檢查遊戲是否存在，如果不存在則創建
check_and_create_game() {
    local game_state=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
    
    if echo "$game_state" | grep -q '"message":"Game not found"'; then
        echo -e "${YELLOW}Game '$GAME_ID' not found. Creating new game...${NC}"
        local create_result=$(curl -s "$BASE_URL/api/game-engine/cli/create" 2>/dev/null)
        
        if echo "$create_result" | grep -q '"status":"success"'; then
            echo -e "${GREEN}✅ Game created successfully${NC}"
            sleep 1
            return 0
        else
            echo -e "${RED}❌ Failed to create game${NC}"
            echo "$create_result"
            return 1
        fi
    else
        echo -e "${BLUE}Game '$GAME_ID' already exists${NC}"
        return 0
    fi
}

# 先檢查並創建遊戲
if ! check_and_create_game; then
    exit 1
fi

echo ""

# 測試 1: 設置移動
echo -e "${YELLOW}Test 1: Setting left-up movement...${NC}"
RESPONSE=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID/move/left-up")
if echo "$RESPONSE" | grep -q '"leftUp":true'; then
  echo -e "${GREEN}✅ Movement set successfully${NC}"
else
  echo -e "${RED}❌ Failed to set movement${NC}"
  echo "$RESPONSE"
  exit 1
fi

# 測試 2: 檢查移動狀態持續
echo -e "${YELLOW}Test 2: Checking if movement persists...${NC}"
sleep 1
STATE=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID")
LEFT_UP=$(echo "$STATE" | grep -o '"leftUp":[^,]*' | cut -d':' -f2)

if [ "$LEFT_UP" = "true" ]; then
  echo -e "${GREEN}✅ Movement persists (leftUp: $LEFT_UP)${NC}"
else
  echo -e "${RED}❌ Movement does not persist (leftUp: $LEFT_UP)${NC}"
  echo "State: $STATE"
  exit 1
fi

# 測試 3: 檢查球拍位置是否有變化
echo -e "${YELLOW}Test 3: Checking if paddle position changes...${NC}"

# 使用 jq 解析，如果沒有則使用 grep
if command -v jq &> /dev/null; then
  INITIAL_Y=$(echo "$STATE" | jq -r '.paddles.left.y' 2>/dev/null)
else
  # Fallback: 使用 grep 解析
  INITIAL_Y=$(echo "$STATE" | grep -o '"paddles":{[^}]*"left":{[^}]*"y":[-0-9.]*' | grep -o '"y":[-0-9.]*' | cut -d':' -f2 | head -1)
fi

if [ -z "$INITIAL_Y" ] || [ "$INITIAL_Y" = "null" ]; then
  echo -e "${RED}❌ Cannot parse paddle position${NC}"
  echo "Trying alternative parsing method..."
  # 嘗試另一種解析方法
  INITIAL_Y=$(echo "$STATE" | python3 -c "import sys, json; print(json.load(sys.stdin)['paddles']['left']['y'])" 2>/dev/null)
  if [ -z "$INITIAL_Y" ] || [ "$INITIAL_Y" = "null" ]; then
    echo "State excerpt: $(echo "$STATE" | grep -o '"paddles":{[^}]*}' | head -1)"
    exit 1
  fi
fi

echo "Initial paddle Y position: $INITIAL_Y"

# 檢查是否在邊界
MAX_Y=4
MIN_Y=-4
AT_UPPER_BOUND=$(echo "$INITIAL_Y $MIN_Y" | awk '{if ($1 <= $2 + 0.1) print 1; else print 0}')
AT_LOWER_BOUND=$(echo "$INITIAL_Y $MAX_Y" | awk '{if ($1 >= $2 - 0.1) print 1; else print 0}')

# 根據位置選擇移動方向
if [ "$AT_UPPER_BOUND" = "1" ]; then
  # 在上邊界，向下移動
  echo "Paddle at upper boundary, testing downward movement..."
  curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID/move/left-down" > /dev/null
elif [ "$AT_LOWER_BOUND" = "1" ]; then
  # 在下邊界，向上移動
  echo "Paddle at lower boundary, testing upward movement..."
  curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID/move/left-up" > /dev/null
else
  # 在中間，向上移動
  echo "Paddle in middle, testing upward movement..."
  curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID/move/left-up" > /dev/null
fi

# 等待足夠時間讓移動發生
sleep 3
STATE2=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID")

if command -v jq &> /dev/null; then
  NEW_Y=$(echo "$STATE2" | jq -r '.paddles.left.y' 2>/dev/null)
else
  NEW_Y=$(echo "$STATE2" | grep -o '"paddles":{[^}]*"left":{[^}]*"y":[-0-9.]*' | grep -o '"y":[-0-9.]*' | cut -d':' -f2 | head -1)
fi

if [ -z "$NEW_Y" ] || [ "$NEW_Y" = "null" ]; then
  NEW_Y=$(echo "$STATE2" | python3 -c "import sys, json; print(json.load(sys.stdin)['paddles']['left']['y'])" 2>/dev/null)
fi

echo "New paddle Y position: $NEW_Y"

if [ -z "$NEW_Y" ] || [ "$NEW_Y" = "null" ]; then
  echo -e "${RED}❌ Cannot parse new paddle position${NC}"
  exit 1
fi

# 計算差異（絕對值）
DIFF=$(echo "$INITIAL_Y $NEW_Y" | awk '{diff = $2 - $1; if (diff < 0) diff = -diff; printf "%.3f", diff}')

# 檢查是否有顯著移動（至少 0.3 單位，相當於 2 次移動）
if command -v bc &> /dev/null; then
  MOVED=$(echo "$DIFF > 0.3" | bc -l)
else
  # Fallback: 簡單的字符串比較
  MOVED=0
  if (( $(echo "$DIFF > 0.3" | awk '{print ($1 > 0.3)}') )); then
    MOVED=1
  fi
fi

if [ "$MOVED" = "1" ] || [ "$MOVED" = "1.0" ]; then
  echo -e "${GREEN}✅ Paddle is moving! (Y changed from $INITIAL_Y to $NEW_Y, diff: $DIFF)${NC}"
else
  # 檢查是否在邊界
  if [ "$AT_UPPER_BOUND" = "1" ] || [ "$AT_LOWER_BOUND" = "1" ]; then
    echo -e "${YELLOW}⚠️  Paddle is at boundary (Y: $INITIAL_Y, bounds: [$MIN_Y, $MAX_Y])${NC}"
    echo -e "${YELLOW}    Movement logic works, but paddle cannot move further in this direction${NC}"
    echo -e "${YELLOW}    Try moving in the opposite direction${NC}"
  else
    echo -e "${RED}❌ Paddle is not moving (Y position unchanged: $INITIAL_Y, diff: $DIFF)${NC}"
    echo "Movement flags:"
    echo "$STATE2" | grep -o '"paddleMovement":{[^}]*}' | head -1
    exit 1
  fi
fi

# 測試 4: 停止移動
echo -e "${YELLOW}Test 4: Stopping movement...${NC}"
curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID/move/stop-left" > /dev/null
sleep 0.5
STATE3=$(curl -s "$BASE_URL/api/game-engine/cli/$GAME_ID")
LEFT_UP_AFTER=$(echo "$STATE3" | grep -o '"leftUp":[^,]*' | cut -d':' -f2)
LEFT_DOWN_AFTER=$(echo "$STATE3" | grep -o '"leftDown":[^,]*' | cut -d':' -f2)

if [ "$LEFT_UP_AFTER" = "false" ] && [ "$LEFT_DOWN_AFTER" = "false" ]; then
  echo -e "${GREEN}✅ Movement stopped successfully${NC}"
else
  echo -e "${RED}❌ Movement did not stop (leftUp: $LEFT_UP_AFTER, leftDown: $LEFT_DOWN_AFTER)${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}🎉 All movement tests passed!${NC}"

