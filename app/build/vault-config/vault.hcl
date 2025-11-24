# Vault 配置檔案
# 基本配置用於開發環境

storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

api_addr = "http://0.0.0.0:8200"
ui = true

# 開發模式（生產環境應該使用更安全的配置）
disable_mlock = true
