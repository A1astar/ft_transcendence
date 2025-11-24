FROM hashicorp/vault:latest

# 創建必要的目錄
RUN mkdir -p /vault/data /vault/config

# 創建默認配置文件
# 注意：docker-compose.yml 已經掛載了 ./vault-config 目錄到 /vault/config
# 這裡創建默認配置，但會被 volume 掛載覆蓋
RUN echo 'storage "file" { path = "/vault/data" }' > /vault/config/vault.hcl && \
    echo 'listener "tcp" { address = "0.0.0.0:8200" tls_disable = 1 }' >> /vault/config/vault.hcl && \
    echo 'api_addr = "http://0.0.0.0:8200"' >> /vault/config/vault.hcl && \
    echo 'ui = true' >> /vault/config/vault.hcl && \
    echo 'disable_mlock = true' >> /vault/config/vault.hcl

# 設置工作目錄
WORKDIR /vault

# 暴露 Vault 端口
EXPOSE 8200

# 啟動 Vault（配置文件會被 docker-compose volume 掛載覆蓋）
CMD ["vault", "server", "-config=/vault/config/vault.hcl"]
