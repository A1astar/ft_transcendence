#!/bin/bash

# Start both services with shared JWT_SECRET in background
SHARED_SECRET="ft_transcendence_shared_jwt_secret_key_2024_do_not_use_in_production"

echo "🚀 啟動服務（使用共享 JWT_SECRET）"
echo ""

# Stop existing services first
echo "🛑 停止舊服務..."
pkill -f "node.*authentication" 2>/dev/null
pkill -f "node.*game-engine" 2>/dev/null
pkill -f "node.*game-orchestration" 2>/dev/null
sleep 2

# Ensure they are dead
pkill -9 -f "node.*authentication" 2>/dev/null
pkill -9 -f "node.*game-engine" 2>/dev/null
pkill -9 -f "node.*game-orchestration" 2>/dev/null

# Set shared secret
export JWT_SECRET="$SHARED_SECRET"

# Start authentication service
echo "🔵 啟動 Authentication 服務..."
cd app/services/authentication

# Load environment variables from .env if it exists
if [ -f .env ]; then
    echo "   📝 Loading .env file..."
    export $(grep -v '^#' .env | xargs)
fi

JWT_SECRET="$SHARED_SECRET" npm start > /tmp/auth.log 2>&1 &
AUTH_PID=$!
echo "   ✅ Authentication 已啟動 (PID: $AUTH_PID)"
cd - > /dev/null

# Wait a bit for auth to start
sleep 2

# Start game-engine service
echo "🟢 啟動 Game Engine 服務..."
cd app/services/game-engine
JWT_SECRET="$SHARED_SECRET" npm start > /tmp/game-engine.log 2>&1 &
GAME_PID=$!
echo "   ✅ Game Engine 已啟動 (PID: $GAME_PID)"
cd - > /dev/null

# Start game-orchestration service
echo "🟣 啟動 Game Orchestration 服務..."
cd app/services/game-orchestration
# Game Orchestration might not need JWT_SECRET but it's good practice if it uses it later
npm start > /tmp/game-orchestration.log 2>&1 &
ORCH_PID=$!
echo "   ✅ Game Orchestration 已啟動 (PID: $ORCH_PID)"
cd - > /dev/null

echo ""
echo "✅ 所有服務都已啟動"
echo ""
echo "📋 服務狀態："
echo "   Authentication:    http://localhost:3001 (PID: $AUTH_PID)"
echo "   Game Engine:       http://localhost:3003 (PID: $GAME_PID)"
echo "   Game Orchestration: http://localhost:3002 (PID: $ORCH_PID)"
echo ""
echo "📝 日誌文件："
echo "   Authentication:    tail -f /tmp/auth.log"
echo "   Game Engine:       tail -f /tmp/game-engine.log"
echo "   Game Orchestration: tail -f /tmp/game-orchestration.log"
echo ""
echo "🛑 停止服務："
echo "   pkill -f 'node.*authentication'"
echo "   pkill -f 'node.*game-engine'"
echo "   pkill -f 'node.*game-orchestration'"
echo ""
echo "💡 等待 3 秒後，重新登入 CLI："
echo "   cd app/services/game-engine"
echo "   ./cli-pong.sh --login --username YOUR_USERNAME --password YOUR_PASSWORD"