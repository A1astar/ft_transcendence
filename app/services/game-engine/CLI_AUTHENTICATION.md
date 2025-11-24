# CLI 認證使用指南 / CLI Authentication Guide

本文檔說明如何使用帶有 JWT 認證的 CLI 遊戲腳本。

This document explains how to use the CLI game scripts with JWT authentication.

---

## 📋 概述 / Overview

CLI 遊戲腳本現在需要 JWT 認證才能使用。這確保了：

The CLI game scripts now require JWT authentication to use. This ensures:

- ✅ 只有已註冊用戶可以使用 CLI API / Only registered users can use CLI API
- ✅ 遊戲統計正確記錄到用戶帳號 / Game statistics are correctly recorded to user accounts
- ✅ 與 Web 用戶配對時身份一致 / Consistent identity when matching with Web users
- ✅ 防止身份冒充和 API 濫用 / Prevents identity spoofing and API abuse

---

## 🚀 快速開始 / Quick Start

### 方法 1: 使用登入腳本（推薦）/ Method 1: Using Login Script (Recommended)

```bash
# 1. 登入並保存 token
./cli-login.sh --username your_username --password your_password

# 2. 使用保存的 token 玩遊戲
./cli-game.sh <game-id>
```

### 方法 2: 在遊戲腳本中直接登入 / Method 2: Login Directly in Game Script

```bash
./cli-game.sh --login --username your_username --password your_password <game-id>
```

### 方法 3: 使用現有 Token / Method 3: Use Existing Token

```bash
./cli-game.sh --token YOUR_JWT_TOKEN <game-id>
```

---

## 📝 詳細使用說明 / Detailed Usage

### 登入腳本 / Login Script

`cli-login.sh` 用於登入並保存 JWT token。

`cli-login.sh` is used to login and save JWT token.

**基本用法 / Basic Usage:**

```bash
./cli-login.sh
```

腳本會提示輸入用戶名和密碼。

The script will prompt for username and password.

**使用參數 / With Parameters:**

```bash
./cli-login.sh --username alice --password secret123
```

**Token 存儲位置 / Token Storage:**

Token 會保存在 `~/.ft_transcendence_cli_token` 文件中。

Token is saved in `~/.ft_transcendence_cli_token` file.

---

### 遊戲腳本 / Game Script

`cli-game.sh` 用於觀看和玩遊戲。

`cli-game.sh` is used to watch and play games.

**基本用法（使用保存的 token）/ Basic Usage (using saved token):**

```bash
./cli-game.sh <game-id>
```

**登入並玩遊戲 / Login and Play:**

```bash
./cli-game.sh --login --username alice --password secret123 <game-id>
```

**使用指定 token / Use Specified Token:**

```bash
./cli-game.sh --token YOUR_JWT_TOKEN <game-id>
```

**參數說明 / Parameters:**

- `--login`: 執行登入流程 / Perform login flow
- `--username USERNAME`: 指定用戶名 / Specify username
- `--password PASSWORD`: 指定密碼 / Specify password
- `--token TOKEN`: 使用現有 JWT token / Use existing JWT token
- `<game-id>`: 遊戲 ID（必需）/ Game ID (required)

---

## 🔐 認證流程 / Authentication Flow

1. **登入 / Login**
   - 用戶提供用戶名和密碼 / User provides username and password
   - 腳本調用 `/api/auth/login` 端點 / Script calls `/api/auth/login` endpoint
   - 接收 JWT access token / Receive JWT access token
   - Token 保存到 `~/.ft_transcendence_cli_token` / Token saved to `~/.ft_transcendence_cli_token`

2. **使用 Token / Using Token**
   - 所有 API 請求都包含 `Authorization: Bearer <token>` header / All API requests include `Authorization: Bearer <token>` header
   - Game Engine 服務驗證 token / Game Engine service verifies token
   - 如果 token 過期，需要重新登入 / If token expires, re-login required

3. **Token 過期處理 / Token Expiration Handling**
   - Token 有效期為 15 分鐘 / Token expires in 15 minutes
   - 如果 token 過期，腳本會顯示錯誤並提示重新登入 / If token expires, script shows error and prompts re-login
   - 可以運行 `./cli-login.sh` 獲取新 token / Run `./cli-login.sh` to get new token

---

## 🎮 完整範例 / Complete Examples

### 範例 1: 首次使用 / Example 1: First Time Use

```bash
# 1. 登入
./cli-login.sh --username alice --password mypassword

# 2. 加入配對隊列（需要先通過 API 創建遊戲或加入隊列）
# 這需要通過 API 調用，例如：
curl -X POST http://localhost:3003/api/game-engine/cli/match \
  -H "Authorization: Bearer $(cat ~/.ft_transcendence_cli_token)" \
  -H "Content-Type: application/json"

# 3. 觀看遊戲
./cli-game.sh <game-id-from-match-response>
```

### 範例 2: 使用現有 Token / Example 2: Using Existing Token

```bash
# 如果你已經有 token（例如從 Web 應用獲取）
TOKEN="your_jwt_token_here"
./cli-game.sh --token "$TOKEN" <game-id>
```

### 範例 3: 一次性登入和遊戲 / Example 3: One-time Login and Play

```bash
./cli-game.sh --login --username alice --password mypassword <game-id>
```

---

## 🔧 故障排除 / Troubleshooting

### 問題: "Authentication failed! Token may be expired."

**解決方案 / Solution:**

```bash
# 重新登入
./cli-login.sh
```

### 問題: "Cannot connect to game server"

**解決方案 / Solution:**

確保 Game Engine 服務正在運行：

Make sure Game Engine service is running:

```bash
# 檢查服務是否運行
curl http://localhost:3003/api/game-engine/cli/create

# 如果服務未運行，啟動它
cd app/services/game-engine
npm start
```

### 問題: "You are not authorized to access this game"

**解決方案 / Solution:**

確保你是該遊戲的玩家。只有遊戲中的玩家才能訪問遊戲狀態。

Make sure you are a player in the game. Only players in the game can access game state.

### 問題: Token 文件權限問題

**解決方案 / Solution:**

```bash
# 設置正確的權限
chmod 600 ~/.ft_transcendence_cli_token
```

---

## 📡 API 端點 / API Endpoints

所有 CLI API 端點現在都需要 JWT 認證：

All CLI API endpoints now require JWT authentication:

- `GET /api/game-engine/cli/:gameId` - 獲取遊戲狀態 / Get game state
- `POST /api/game-engine/cli/match` - 加入配對隊列 / Join match queue
- `GET /api/game-engine/cli/:gameId/move/:action` - 控制球拍 / Control paddle
- `DELETE /api/game-engine/cli/:gameId` - 結束遊戲 / End game

所有請求都需要在 header 中包含：

All requests need to include in header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔒 安全注意事項 / Security Notes

1. **Token 存儲 / Token Storage**
   - Token 保存在用戶主目錄的隱藏文件中 / Token saved in hidden file in user home directory
   - 文件權限設置為 600（僅所有者可讀寫）/ File permissions set to 600 (read-write for owner only)
   - 不要分享你的 token / Do not share your token

2. **Token 過期 / Token Expiration**
   - Access token 有效期為 15 分鐘 / Access token expires in 15 minutes
   - 過期後需要重新登入 / Re-login required after expiration

3. **密碼安全 / Password Security**
   - 不要在命令行中直接輸入密碼（使用 `--password` 參數時會顯示在進程列表中）/ Do not enter password directly in command line (visible in process list when using `--password`)
   - 建議使用 `./cli-login.sh` 腳本，它會隱藏密碼輸入 / Recommended to use `./cli-login.sh` script which hides password input

---

## 📚 相關文檔 / Related Documentation

- [REQUIREMENTS_STATUS.md](../../REQUIREMENTS_STATUS.md) - 項目需求狀態
- [EASY_TO_COMPLETE_MAJOR.md](../../EASY_TO_COMPLETE_MAJOR.md) - 容易完成的項目分析

---

**最後更新 / Last Updated**: 2024年

