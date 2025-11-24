#!/bin/bash

# CLI API 自動化測試腳本
# 使用方法: ./test-cli-api.sh

set -e

AUTH_URL="http://localhost:3001"
GAME_URL="http://localhost:3003"
TEST_USER="testuser"
TEST_PASS="testpass123"
TEST_EMAIL="test@example.com"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== CLI API 測試開始 ===${NC}"
echo ""

# 1. 檢查服務狀態
echo -e "${BLUE}1. 檢查服務狀態...${NC}"
if ! curl -s "$AUTH_URL/api/auth/login" > /dev/null 2>&1; then
    echo -e "${RED}❌ Authentication 服務未運行 (port 3001)${NC}"
    echo "   請先啟動: cd app/services/authentication && npm start"
    exit 1
fi
if ! curl -s "$GAME_URL/api/game-engine/cli/create" > /dev/null 2>&1; then
    echo -e "${RED}❌ Game Engine 服務未運行 (port 3003)${NC}"
    echo "   請先啟動: cd app/services/game-engine && npm start"
    exit 1
fi
echo -e "${GREEN}✅ 服務運行正常${NC}"
echo ""

# 2. 註冊測試用戶
echo -e "${BLUE}2. 註冊測試用戶...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$TEST_USER\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\"}")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ 用戶註冊成功${NC}"
elif echo "$REGISTER_RESPONSE" | grep -q '"error"'; then
    ERROR_MSG=$(echo "$REGISTER_RESPONSE" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
    if echo "$ERROR_MSG" | grep -q "already exists"; then
        echo -e "${YELLOW}⚠️  用戶已存在，將使用現有用戶${NC}"
    else
        echo -e "${RED}❌ 註冊失敗: $ERROR_MSG${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  註冊回應異常，嘗試登入...${NC}"
fi
echo ""

# 3. 登入獲取 token
echo -e "${BLUE}3. 登入獲取 token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$TEST_USER\", \"password\": \"$TEST_PASS\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"error"'; then
    ERROR_MSG=$(echo "$LOGIN_RESPONSE" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
    echo -e "${RED}❌ 登入失敗: $ERROR_MSG${NC}"
    exit 1
fi

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    if command -v jq &> /dev/null; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.tokens.accessToken // empty')
    fi
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ 登入失敗，無法獲取 token${NC}"
    echo "回應: $LOGIN_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ 登入成功，token 已獲取${NC}"
echo ""

# 4. 測試創建遊戲
echo -e "${BLUE}4. 測試創建遊戲（不需要認證）...${NC}"
CREATE_RESPONSE=$(curl -s "$GAME_URL/api/game-engine/cli/create")
if echo "$CREATE_RESPONSE" | grep -q '"status":"success"'; then
    GAME_ID=$(echo "$CREATE_RESPONSE" | grep -o '"gameId":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ 遊戲創建成功: $GAME_ID${NC}"
else
    echo -e "${RED}❌ 遊戲創建失敗${NC}"
    echo "回應: $CREATE_RESPONSE"
    exit 1
fi
echo ""

# 5. 測試獲取遊戲狀態（無認證，應該失敗）
echo -e "${BLUE}5. 測試獲取遊戲狀態（無認證，應該失敗）...${NC}"
NO_AUTH_RESPONSE=$(curl -s "$GAME_URL/api/game-engine/cli/$GAME_ID")
if echo "$NO_AUTH_RESPONSE" | grep -q '"error"'; then
    echo -e "${GREEN}✅ 無認證請求正確返回錯誤${NC}"
else
    echo -e "${YELLOW}⚠️  無認證請求未返回錯誤（可能配置有問題）${NC}"
    echo "回應: $NO_AUTH_RESPONSE"
fi
echo ""

# 6. 測試獲取遊戲狀態（有認證）
echo -e "${BLUE}6. 測試獲取遊戲狀態（有認證）...${NC}"
AUTH_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$GAME_URL/api/game-engine/cli/$GAME_ID")
if echo "$AUTH_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ 認證請求成功獲取遊戲狀態${NC}"
else
    echo -e "${RED}❌ 認證請求失敗${NC}"
    echo "回應: $AUTH_RESPONSE"
    exit 1
fi
echo ""

# 7. 測試控制球拍
echo -e "${BLUE}7. 測試控制球拍...${NC}"
MOVE_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$GAME_URL/api/game-engine/cli/$GAME_ID/move/left-up")
if echo "$MOVE_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ 球拍控制成功${NC}"
else
    echo -e "${RED}❌ 球拍控制失敗${NC}"
    echo "回應: $MOVE_RESPONSE"
    exit 1
fi
echo ""

# 8. 測試無效動作（應該失敗）
echo -e "${BLUE}8. 測試無效動作（應該失敗）...${NC}"
INVALID_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$GAME_URL/api/game-engine/cli/$GAME_ID/move/invalid-action")
if echo "$INVALID_RESPONSE" | grep -q '"error"'; then
    echo -e "${GREEN}✅ 無效動作正確返回錯誤${NC}"
else
    echo -e "${YELLOW}⚠️  無效動作未返回錯誤${NC}"
    echo "回應: $INVALID_RESPONSE"
fi
echo ""

# 9. 測試輸入驗證（無效 gameId）
echo -e "${BLUE}9. 測試輸入驗證（無效 gameId）...${NC}"
INVALID_GAME_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$GAME_URL/api/game-engine/cli/invalid-game-id")
if echo "$INVALID_GAME_RESPONSE" | grep -q '"error"'; then
    echo -e "${GREEN}✅ 無效 gameId 正確返回錯誤${NC}"
else
    echo -e "${YELLOW}⚠️  無效 gameId 未返回錯誤${NC}"
fi
echo ""

# 10. 測試結束遊戲
echo -e "${BLUE}10. 測試結束遊戲...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  "$GAME_URL/api/game-engine/cli/$GAME_ID")
if echo "$DELETE_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ 遊戲結束成功${NC}"
else
    echo -e "${YELLOW}⚠️  遊戲結束可能失敗（遊戲可能已不存在）${NC}"
    echo "回應: $DELETE_RESPONSE"
fi
echo ""

# 11. 測試 CLI 腳本
echo -e "${BLUE}11. 測試 CLI 登入腳本...${NC}"
if [ -f "./cli-login.sh" ]; then
    # 測試登入腳本（使用已存在的用戶）
    if ./cli-login.sh --username "$TEST_USER" --password "$TEST_PASS" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ CLI 登入腳本工作正常${NC}"
        if [ -f "$HOME/.ft_transcendence_cli_token" ]; then
            echo -e "${GREEN}✅ Token 已保存到文件${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  CLI 登入腳本可能有問題${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  cli-login.sh 不存在${NC}"
fi
echo ""

echo -e "${GREEN}=== 所有基本測試完成 ===${NC}"
echo ""
echo -e "${BLUE}下一步測試:${NC}"
echo "1. 手動測試 CLI 遊戲腳本: ./cli-game.sh <game-id>"
echo "2. 測試 CLI 與 Web 用戶配對（需要啟動 Web 前端）"
echo "3. 測試遊戲狀態同步"
echo ""
echo -e "${BLUE}詳細測試指南請參考: CLI_API_TESTING_GUIDE.md${NC}"

