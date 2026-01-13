# JWT + Vault（本專案實作說明）

### 這份文件在講什麼
本專案使用 **JWT（JSON Web Token）** 來做「登入後的身份驗證」，並使用 **HashiCorp Vault（KV v2）** 來管理 JWT 簽章用的 **`jwt_secret`**（敏感資訊/密鑰），避免把 secret 寫死在 repo 或每次重啟變動造成 token 失效。

---

### JWT 是什麼？在這個專案怎麼用？
- **JWT** 是一段被簽名的字串（header.payload.signature）。
- **簽名（sign）**：伺服器用 `jwt_secret` 對 payload 簽名，產生 token。
- **驗證（verify）**：伺服器收到 token 後，用同一把 `jwt_secret` 驗證簽名是否正確，避免 token 被竄改。
- **有效期限（exp）**：本專案預設 token 有效期（例如 15 分鐘），過期就必須重新登入。

本專案的 token 由 **authentication service** 簽發，並以 **HttpOnly cookie** 的方式回給瀏覽器：
- cookie 名稱：`access_token`
- cookie 具備 `HttpOnly`、`Secure`、`SameSite=Lax`
- 前端呼叫 API 時使用 `credentials: "include"` 讓瀏覽器自動帶 cookie

---

### 為什麼要用 Vault 管理 JWT secret？
如果 `jwt_secret` 不固定（例如每次啟動隨機生成），會出現以下問題：
- **服務重啟 → 全部 token 失效**：使用者會被迫重新登入。
- **多容器/多副本不相容**：A 簽發的 token，B 用不同 secret 驗證會失敗（401）。

把 `jwt_secret` 放在 Vault（加密、權限控管）有以下好處：
- **穩定一致**：所有實例都讀到同一把 secret。
- **不落地在 repo**：避免把密鑰寫在 `.env` 或程式碼。
- **可控權限**：只授權需要的服務讀取/寫入。
- **可輪替（rotation）**：日後可更換 secret（需同時配合讓舊 token 過期或做版本管理）。

---

### 本專案把 `jwt_secret` 存在哪裡？
本專案使用 Vault KV v2 的 `secret` mount：
- **Vault mount**：`secret/`（KV v2）
- **資料路徑（CLI/UI）**：`secret/authentication/jwt`
- **欄位**：`jwt_secret`

> 備註：`secret/data/authentication/jwt` 是 KV v2 的 **HTTP API** 路徑格式；在 Vault CLI/UI 通常用 `vault kv get secret/authentication/jwt`。

---

### 如何確認 `jwt_secret`（推薦用 Vault container 內的 CLI）
#### 方式 A：直接用 root token（最不會踩到 token 存檔權限問題）
在本機終端機執行：

```bash
docker exec -it transcendence-hashicorp-vault-1 sh
```

在容器內執行：

```sh
export VAULT_ADDR="https://127.0.0.1:8200"
export VAULT_CACERT="/vault/certs/ca.crt"
export VAULT_TOKEN="$(cat /vault/keys/root-token.txt)"

vault kv get secret/authentication/jwt
```

你應該會看到類似輸出（Key 為 `jwt_secret`）：

```text
======= Data =======
Key         Value
---         -----
jwt_secret  <some-hex-secret>
```

#### 方式 B：用 `vault login`（先切到可寫目錄避免 permission denied）
```bash
docker exec -it transcendence-hashicorp-vault-1 sh
```

```sh
cd /tmp
export HOME=/tmp
export VAULT_ADDR="https://127.0.0.1:8200"
export VAULT_CACERT="/vault/certs/ca.crt"

vault login "$(cat /vault/keys/root-token.txt)"
vault kv get secret/authentication/jwt
```

---

### `jwt_secret` 是怎麼被產生/寫入 Vault 的？
authentication service 會在啟動時：
- 先嘗試從 Vault 讀取 `secret/authentication/jwt` 的 `jwt_secret`
- 讀不到時（且在 dev/demo 設定允許時）會生成一次 random secret，並寫入 Vault

在 docker compose 內，本專案有啟用（dev/demo）自動 seed 的環境變數：
- `AUTH_JWT_AUTO_SEED=true`

所以你第一次啟動時看到 log：
- `[auth] Seeded JWT secret to Vault`

表示 `jwt_secret` 已經成功寫入 Vault。

---

### 快速測試 JWT cookie 是否正常工作（curl）
以下示範透過 API 註冊/登入，並用 cookie 呼叫 `/userinfo`：

```bash
BASE='https://localhost:8443'
EMAIL='test01@e.co'
USER='test01'
PASS='pass1234'

# register
curl -sk -H 'Content-Type: application/json' \
  --data "{\"email\":\"$EMAIL\",\"name\":\"$USER\",\"password\":\"$PASS\"}" \
  "$BASE/api/auth/register"

# login (save cookie)
curl -sk -i -c /tmp/tt_cookie.txt -H 'Content-Type: application/json' \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  "$BASE/api/auth/login" | sed -n '1,40p'

# userinfo (send cookie)
curl -sk -i -b /tmp/tt_cookie.txt "$BASE/api/auth/userinfo" | sed -n '1,60p'
```

若登入成功，你會在 login 回應 header 看到：
- `set-cookie: access_token=...`

並且 `/userinfo` 應回 `200`。
