# Game Engine Service - Server-Side Pong API

遊戲引擎服務提供伺服器端的 Pong 遊戲邏輯和 REST API。

The Game Engine Service provides server-side Pong game logic and REST API.

---

## 📋 概述 / Overview

Game Engine 服務負責：
- 運行伺服器端遊戲循環 / Running server-side game loop
- 管理遊戲狀態 / Managing game state
- 提供 REST API 供 CLI 和 Web 客戶端使用 / Providing REST API for CLI and Web clients
- WebSocket 即時通訊 / WebSocket real-time communication
- JWT 認證保護 / JWT authentication protection

---

## 🚀 快速開始 / Quick Start

### 安裝依賴 / Install Dependencies

```bash
cd app/services/game-engine
npm install
```

### 建置 / Build

```bash
npm run build
```

### 啟動服務 / Start Service

```bash
npm start
```

### 開發模式（自動重新編譯）/ Development Mode (Auto Recompile)

```bash
npm run watch
```

---

## 🔌 API 端點 / API Endpoints

### 基礎資訊 / Base Information

- **Base URL**: `http://localhost:3003`
- **認證方式**: JWT Bearer Token（大部分端點需要）/ JWT Bearer Token (most endpoints require)
- **Content-Type**: `application/json`

### 認證 / Authentication

所有需要認證的端點都需要在請求 header 中包含：

All authenticated endpoints require the following in request header:

```
Authorization: Bearer <JWT_TOKEN>
```

獲取 JWT token 的方式：

How to get JWT token:

```bash
# 登入獲取 token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "username", "password": "password"}'
```

---

## 📡 API 端點詳情 / API Endpoints Details

### 1. 創建本地遊戲 / Create Local Game

創建一個本地測試遊戲（不需要認證，僅用於測試）。

Create a local test game (no authentication required, for testing only).

**端點 / Endpoint:**
```
GET /api/game-engine/cli/create
```

**請求範例 / Request Example:**
```bash
curl http://localhost:3003/api/game-engine/cli/create
```

**回應範例 / Response Example:**
```json
{
  "status": "success",
  "gameId": "cli-match",
  "message": "Local game created",
  "players": [
    {"id": "cli-player1", "alias": "alice"},
    {"id": "cli-player2", "alias": "bob"}
  ],
  "mode": "local"
}
```

---

### 2. 獲取遊戲狀態 / Get Game State

獲取指定遊戲的當前狀態（需要認證）。

Get current state of a specific game (requires authentication).

**端點 / Endpoint:**
```
GET /api/game-engine/cli/:gameId
```

**認證 / Authentication:** ✅ 需要 / Required

**路徑參數 / Path Parameters:**
- `gameId` (string, required): 遊戲 ID

**請求範例 / Request Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3003/api/game-engine/cli/cli-match
```

**回應範例 / Response Example:**
```json
{
  "status": "success",
  "gameId": "cli-match",
  "mode": "local",
  "players": [
    {"id": "cli-player1", "alias": "alice"},
    {"id": "cli-player2", "alias": "bob"}
  ],
  "ball": {
    "x": 0.5,
    "y": 0.3,
    "vx": 0.1,
    "vy": 0.05
  },
  "paddles": {
    "left": {"y": 0, "height": 2},
    "right": {"y": 0, "height": 2}
  },
  "score": {
    "left": 0,
    "right": 0
  },
  "paddleMovement": {
    "leftUp": false,
    "leftDown": false,
    "rightUp": false,
    "rightDown": false
  }
}
```

**錯誤回應 / Error Responses:**
- `401 Unauthorized`: 缺少或無效的 JWT token
- `403 Forbidden`: 用戶不是該遊戲的玩家
- `404 Not Found`: 遊戲不存在

---

### 3. 加入配對隊列 / Join Match Queue

加入配對隊列以與 Web 用戶對戰（需要認證）。

Join match queue to play against Web users (requires authentication).

**端點 / Endpoint:**
```
POST /api/game-engine/cli/match
```

**認證 / Authentication:** ✅ 需要 / Required

**請求範例 / Request Example:**
```bash
curl -X POST http://localhost:3003/api/game-engine/cli/match \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**回應範例 - 等待中 / Response Example - Waiting:**
```json
{
  "status": "waiting",
  "message": "Waiting for opponent...",
  "playerAlias": "alice"
}
```

**回應範例 - 配對成功 / Response Example - Matched:**
```json
{
  "status": "matched",
  "gameId": "match-12345",
  "match": {
    "id": "match-12345",
    "players": [
      {"id": "user-1", "alias": "alice"},
      {"id": "user-2", "alias": "bob"}
    ],
    "mode": "remote2"
  },
  "message": "Match found!"
}
```

**錯誤回應 / Error Responses:**
- `401 Unauthorized`: 缺少或無效的 JWT token
- `500 Internal Server Error`: 配對服務錯誤

---

### 4. 控制球拍移動 / Control Paddle Movement

控制遊戲中球拍的移動（需要認證）。

Control paddle movement in the game (requires authentication).

**端點 / Endpoint:**
```
GET /api/game-engine/cli/:gameId/move/:action
```

**認證 / Authentication:** ✅ 需要 / Required

**路徑參數 / Path Parameters:**
- `gameId` (string, required): 遊戲 ID
- `action` (string, required): 動作類型，可選值：
  - `left-up`: 左側球拍向上移動
  - `left-down`: 左側球拍向下移動
  - `right-up`: 右側球拍向上移動
  - `right-down`: 右側球拍向下移動
  - `stop-left`: 停止左側球拍移動
  - `stop-right`: 停止右側球拍移動
  - `stop-all` 或 `stop`: 停止所有球拍移動

**請求範例 / Request Example:**
```bash
# 左側球拍向上移動
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3003/api/game-engine/cli/cli-match/move/left-up

# 停止所有移動
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3003/api/game-engine/cli/cli-match/move/stop-all
```

**回應範例 / Response Example:**
```json
{
  "status": "success",
  "gameId": "cli-match",
  "action": "left-up",
  "message": "Applied left-up",
  "currentMovement": {
    "leftUp": true,
    "leftDown": false,
    "rightUp": false,
    "rightDown": false
  }
}
```

**錯誤回應 / Error Responses:**
- `400 Bad Request`: 無效的動作類型
- `401 Unauthorized`: 缺少或無效的 JWT token
- `403 Forbidden`: 用戶不是該遊戲的玩家
- `404 Not Found`: 遊戲不存在

---

### 5. 結束遊戲 / End Game

結束並刪除指定的遊戲（需要認證）。

End and delete a specific game (requires authentication).

**端點 / Endpoint:**
```
DELETE /api/game-engine/cli/:gameId
```

**認證 / Authentication:** ✅ 需要 / Required

**路徑參數 / Path Parameters:**
- `gameId` (string, required): 遊戲 ID

**請求範例 / Request Example:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3003/api/game-engine/cli/cli-match
```

**回應範例 / Response Example:**
```json
{
  "status": "success",
  "message": "Game ended",
  "gameId": "cli-match"
}
```

**錯誤回應 / Error Responses:**
- `401 Unauthorized`: 缺少或無效的 JWT token
- `403 Forbidden`: 用戶不是該遊戲的玩家
- `404 Not Found`: 遊戲不存在

---

## 🔄 WebSocket 端點 / WebSocket Endpoints

### WebSocket 連接 / WebSocket Connection

```
ws://localhost:3003/game/:gameId
```

WebSocket 用於即時遊戲狀態更新和球拍控制。

WebSocket is used for real-time game state updates and paddle control.

**連接範例 / Connection Example:**
```javascript
const ws = new WebSocket('ws://localhost:3003/game/cli-match');
ws.onmessage = (event) => {
  const gameState = JSON.parse(event.data);
  console.log('Game state:', gameState);
};
```

---

## 📝 錯誤處理 / Error Handling

所有錯誤回應都遵循統一的格式：

All error responses follow a unified format:

```json
{
  "status": "error",
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP 狀態碼 / HTTP Status Codes

- `200 OK`: 請求成功
- `400 Bad Request`: 請求參數錯誤
- `401 Unauthorized`: 未認證或 token 無效
- `403 Forbidden`: 無權限訪問
- `404 Not Found`: 資源不存在
- `500 Internal Server Error`: 伺服器內部錯誤

---

## 🔒 安全注意事項 / Security Notes

1. **JWT Token**
   - Token 有效期為 15 分鐘
   - Token 過期後需要重新登入
   - 不要在客戶端代碼中硬編碼 token

2. **權限驗證**
   - 所有遊戲操作都需要驗證用戶是該遊戲的玩家
   - 只有遊戲中的玩家才能訪問遊戲狀態和控制球拍

3. **輸入驗證**
   - 所有路徑參數都經過驗證
   - 無效的參數會返回 400 錯誤

---

## 🧪 測試 / Testing

### 使用 CLI 腳本測試 / Testing with CLI Scripts

```bash
# 1. 登入獲取 token
./cli-login.sh --username alice --password secret123

# 2. 創建遊戲（測試用）
curl http://localhost:3003/api/game-engine/cli/create

# 3. 觀看遊戲
./cli-game.sh cli-match
```

### 使用 HTTP 請求測試 / Testing with HTTP Requests

參考 `cli-requests.http` 文件中的範例請求。

Refer to example requests in `cli-requests.http` file.

---

## 📚 相關文檔 / Related Documentation

- [CLI_AUTHENTICATION.md](./CLI_AUTHENTICATION.md) - CLI 認證使用指南
- [REQUIREMENTS_STATUS.md](../../REQUIREMENTS_STATUS.md) - 項目需求狀態
- [EASY_TO_COMPLETE_MAJOR.md](../../EASY_TO_COMPLETE_MAJOR.md) - 容易完成的項目分析

---

## 🔧 環境變數 / Environment Variables

- `JWT_SECRET`: JWT 密鑰（與 authentication 服務共享）
- `PORT`: 服務端口（預設: 3003）

---

## 📊 API 版本 / API Version

當前版本: **v1** (無版本前綴)

Current version: **v1** (no version prefix)

未來可能會添加版本前綴（如 `/v1/api/...`）。

Version prefix may be added in the future (e.g., `/v1/api/...`).

---

**最後更新 / Last Updated**: 2024年  
**版本 / Version**: 1.0

