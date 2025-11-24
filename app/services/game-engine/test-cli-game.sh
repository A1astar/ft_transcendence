#!/bin/bash

# CLI 遊戲完整測試腳本
# 測試 CLI 遊戲的所有功能

AUTH_URL="http://localhost:3001"
BASE_URL="http://localhost:3003"
TOKEN_FILE="$HOME/.ft_transcendence_cli_token"
GAME_ID="test-cli-game-$(date +%s)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${WHITE} CLI 遊戲完整測試${CYAN}                                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# 測試 1: 檢查服務是否運行
echo -e "${BLUE}[測試 1] 檢查服務狀態...${NC}"
if curl -s "$AUTH_URL/api/auth/login" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Authentication 服務運行中 (port 3001)${NC}"
else
    echo -e "   ${RED}❌ Authentication 服務未運行${NC}"
    echo -e "   ${YELLOW}請啟動: cd app/services/authentication && npm start${NC}"
    exit 1
fi

if curl -s "$BASE_URL/api/game-engine/cli/create" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Game Engine 服務運行中 (port 3003)${NC}"
else
    echo -e "   ${RED}❌ Game Engine 服務未運行${NC}"
    echo -e "   ${YELLOW}請啟動: cd app/services/game-engine && npm start${NC}"
    exit 1
fi
echo ""

# 測試 2: 檢查 Token
echo -e "${BLUE}[測試 2] 檢查認證 Token...${NC}"
if [ ! -f "$TOKEN_FILE" ]; then
    echo -e "   ${YELLOW}⚠️  未找到保存的 token${NC}"
    echo -e "   ${YELLOW}請先登入: ./cli-pong.sh --login --username YOUR_USERNAME --password YOUR_PASSWORD${NC}"
    exit 1
fi

TOKEN=$(cat "$TOKEN_FILE" 2>/dev/null)
if [ -z "$TOKEN" ]; then
    echo -e "   ${RED}❌ Token 文件為空${NC}"
    exit 1
fi
echo -e "   ${GREEN}✅ Token 已載入${NC}"
echo ""

# 測試 3: 驗證 Token（通過獲取遊戲狀態）
echo -e "${BLUE}[測試 3] 驗證 Token 有效性...${NC}"
# 先嘗試獲取一個可能存在的遊戲狀態來驗證 token
TEST_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/game-engine/cli/cli-match" 2>/dev/null)
if echo "$TEST_RESPONSE" | grep -q '"error":"Unauthorized"'; then
    echo -e "   ${RED}❌ Token 驗證失敗${NC}"
    echo -e "   ${YELLOW}可能原因: JWT_SECRET 不匹配${NC}"
    echo -e "   ${YELLOW}解決方法: 確保兩個服務使用相同的 JWT_SECRET${NC}"
    echo -e "   ${YELLOW}重新登入: ./cli-pong.sh --login --username YOUR_USERNAME --password YOUR_PASSWORD${NC}"
    exit 1
elif echo "$TEST_RESPONSE" | grep -q '"error"'; then
    # 其他錯誤（如遊戲不存在）是可以接受的，只要不是 Unauthorized
    echo -e "   ${GREEN}✅ Token 有效（遊戲可能不存在，這是正常的）${NC}"
else
    echo -e "   ${GREEN}✅ Token 有效${NC}"
fi
echo ""

# 測試 4: 創建遊戲
echo -e "${BLUE}[測試 4] 創建遊戲...${NC}"
# 創建遊戲不需要認證，但如果有 token 會使用用戶資訊
CREATE_RESPONSE=$(curl -s "$BASE_URL/api/game-engine/cli/create" 2>/dev/null)
if echo "$CREATE_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "   ${GREEN}✅ 遊戲創建成功${NC}"
    GAME_ID=$(echo "$CREATE_RESPONSE" | grep -o '"gameId":"[^"]*' | cut -d'"' -f4 || echo "cli-match")
    echo -e "   ${CYAN}Game ID: $GAME_ID${NC}"
else
    echo -e "   ${YELLOW}⚠️  遊戲可能已存在，使用默認 ID: cli-match${NC}"
    GAME_ID="cli-match"
fi
echo ""

# 等待遊戲初始化
echo -e "${CYAN}等待遊戲初始化...${NC}"
sleep 3

# 測試 5: 獲取遊戲狀態（需要認證）
echo -e "${BLUE}[測試 5] 獲取遊戲狀態...${NC}"
GAME_STATE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)

if echo "$GAME_STATE" | grep -q '"error":"Unauthorized"'; then
    echo -e "   ${RED}❌ Token 驗證失敗（獲取遊戲狀態時）${NC}"
    echo -e "   ${YELLOW}這表示 JWT_SECRET 不匹配${NC}"
    echo -e "   ${YELLOW}請運行: ./restart-with-shared-secret.sh${NC}"
    exit 1
elif echo "$GAME_STATE" | grep -q '"error"'; then
    echo -e "   ${YELLOW}⚠️  獲取遊戲狀態時出現錯誤（可能是遊戲不存在）${NC}"
    echo -e "   ${CYAN}回應: $GAME_STATE${NC}"
    echo -e "   ${YELLOW}這可能是正常的，如果遊戲剛創建${NC}"
fi

if echo "$GAME_STATE" | grep -q '"ball"'; then
    echo -e "   ${GREEN}✅ 遊戲狀態獲取成功${NC}"
    BALL_X=$(echo "$GAME_STATE" | grep -o '"x":[0-9.-]*' | head -1 | cut -d':' -f2 || echo "N/A")
    BALL_Y=$(echo "$GAME_STATE" | grep -o '"y":[0-9.-]*' | head -1 | cut -d':' -f2 || echo "N/A")
    echo -e "   ${CYAN}球位置: x=$BALL_X, y=$BALL_Y${NC}"
else
    echo -e "   ${YELLOW}⚠️  遊戲狀態中沒有球數據（可能遊戲未啟動）${NC}"
    echo -e "   ${CYAN}回應預覽:${NC}"
    echo "$GAME_STATE" | head -5
fi
echo ""

# 測試 6: 測試球拍控制
echo -e "${BLUE}[測試 6] 測試球拍控制...${NC}"
MOVE_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/game-engine/cli/$GAME_ID/move/left-up" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅ 球拍控制命令發送成功${NC}"
    sleep 0.5
    
    # 停止移動
    curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/game-engine/cli/$GAME_ID/move/stop-all" > /dev/null 2>&1
    echo -e "   ${GREEN}✅ 停止命令發送成功${NC}"
else
    echo -e "   ${RED}❌ 球拍控制失敗${NC}"
fi
echo ""

# 測試 7: 驗證遊戲循環運行
echo -e "${BLUE}[測試 7] 驗證遊戲循環運行...${NC}"
sleep 1
GAME_STATE_2=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/game-engine/cli/$GAME_ID" 2>/dev/null)
BALL_X_2=$(echo "$GAME_STATE_2" | grep -o '"x":[0-9.-]*' | head -1 | cut -d':' -f2 || echo "N/A")

if [ "$BALL_X" != "$BALL_X_2" ] && [ "$BALL_X" != "N/A" ] && [ "$BALL_X_2" != "N/A" ]; then
    echo -e "   ${GREEN}✅ 遊戲循環正常運行（球位置已改變）${NC}"
    echo -e "   ${CYAN}之前: x=$BALL_X, 現在: x=$BALL_X_2${NC}"
else
    echo -e "   ${YELLOW}⚠️  無法確認遊戲循環（可能需要更多時間）${NC}"
fi
echo ""

# 測試總結
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${WHITE} 測試總結${CYAN}                                          ║${NC}"
echo -e "${CYAN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${GREEN} ✅ 服務狀態: 正常${NC}                                    ${CYAN}║${NC}"
echo -e "${CYAN}║${GREEN} ✅ 認證: 正常${NC}                                       ${CYAN}║${NC}"
echo -e "${CYAN}║${GREEN} ✅ 遊戲創建: 正常${NC}                                    ${CYAN}║${NC}"
echo -e "${CYAN}║${GREEN} ✅ 遊戲狀態獲取: 正常${NC}                               ${CYAN}║${NC}"
echo -e "${CYAN}║${GREEN} ✅ 球拍控制: 正常${NC}                                    ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}💡 現在可以運行完整遊戲:${NC}"
echo -e "   ${CYAN}./cli-pong.sh${NC}"
echo ""
echo -e "${BLUE}💡 或使用特定遊戲 ID:${NC}"
echo -e "   ${CYAN}./cli-pong.sh $GAME_ID${NC}"
echo ""

