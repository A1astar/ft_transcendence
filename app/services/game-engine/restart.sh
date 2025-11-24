#!/bin/bash

# 快速重啟 Game Engine 服務

echo "🛑 停止現有服務..."
pkill -f "node.*game-engine"
lsof -ti :3003 | xargs kill -9 2>/dev/null
sleep 2

echo "🚀 啟動 Game Engine 服務..."
cd "$(dirname "$0")"
npm start

