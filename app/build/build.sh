#!/bin/bash

set -e

app_dir=$(pwd)

directories=(
    "$app_dir/frontend"
    "$app_dir/services/authentication"
    "$app_dir/services/game-engine"
    "$app_dir/services/game-orchestration"
    "$app_dir/services/gateway"
)

checkNodeVersion()
{
    # Load NVM if it exists
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

    if ! command -v nvm &> /dev/null; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    fi

    if ! command -v node &> /dev/null || [ "$(node --version)" != "v24.11.0" ]; then
        nvm install 24.11.0
        nvm use 24.11.0
    fi
}

checkPackageInstallation()
{
    if [ ! -d node_modules ]; then
        npm install
    fi
}

checkPackageUpdate()
{
    cd $app_dir && npx npm-check-updates
    for directory in "${directories[@]}"; do
        cd $directory && npx npm-check-updates
    done
}

upgradePackage()
{
    cd $app_dir && npx npm-check-updates -u
    for directory in "${directories[@]}"; do
        cd $directory && npx npm-check-updates -u
    done
}

mergePackageJson()
{
    [ ! -d node_modules ] && npm install --save-dev jsonc deepmerge

    for directory in "${directories[@]}"; do
        node -e "
        const fs = require('fs');
        const { parse } = require('jsonc');
        const deepmerge = require('deepmerge');

        const packageRoot = parse(fs.readFileSync('$app_dir/package.json', 'utf8'));
        const packageService = parse(fs.readFileSync('$directory/package.json', 'utf8'));
        const mergedPackage = deepmerge(packageRoot, packageService);
        fs.writeFileSync('$directory/prod.package.json', JSON.stringify(mergedPackage, null, 2));

        const tsconfigRoot = parse(fs.readFileSync('$app_dir/tsconfig.json', 'utf8'));
        const tsconfigService = parse(fs.readFileSync('$directory/tsconfig.json', 'utf8'));
        const mergedTsconfig = deepmerge(tsconfigRoot, tsconfigService);
        delete mergedTsconfig.extends;
        fs.writeFileSync('$directory/prod.tsconfig.json', JSON.stringify(mergedTsconfig, null, 2));
        "
    done
}

createFilesAndDirectories()
{
    mkdir -p $app_dir/services/authentication/database \
             $app_dir/infrastructure/hcp-vault/data \
             $app_dir/infrastructure/hcp-vault/keys \
             $app_dir/infrastructure/hcp-vault/certs \
             $app_dir/infrastructure/hcp-vault/secrets

    touch $app_dir/infrastructure/hcp-vault/secrets/approle_role_id \
          $app_dir/infrastructure/hcp-vault/secrets/approle_secret_id
}

removeDirectories()
{
    rm -rf $app_dir/services/authentication/database \
           $app_dir/infrastructure/hcp-vault/data \
           $app_dir/infrastructure/hcp-vault/keys \
           $app_dir/infrastructure/hcp-vault/certs \
           $app_dir/infrastructure/hcp-vault/secrets \
           $app_dir/infrastructure/reverse-proxy/certs \
           $app_dir/frontend/certs
}

setupCertificates()
{
    if [ "$1" = "local" ]; then
        local frontend_dir="$app_dir/frontend"

        mkdir -p $app_dir/frontend/certs
        if [ ! -f $frontend_dir/certs/self.key ]; then
            echo "Generating frontend SSL certificates...";
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout $frontend_dir/certs/self.key \
            -out $frontend_dir/certs/self.crt \
            -subj "/C=TW/ST=Taipei/L=Taipei/O=42/OU=Transcendence/CN=localhost";
        fi

    elif [ "$1" = "prod" ]; then
        local reverse_proxy_dir="$app_dir/infrastructure/reverse-proxy"

        mkdir -p $app_dir/infrastructure/reverse-proxy/certs
        if [ ! -f $reverse_proxy_dir/certs/self.key ]; then
            echo "Generating reverse proxy SSL certificates...";
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout $reverse_proxy_dir/certs/self.key \
            -out $reverse_proxy_dir/certs/self.crt \
            -subj "/C=TW/ST=Taipei/L=Taipei/O=42/OU=Transcendence/CN=localhost";
        fi
    fi

    # HCP-Vault part
    local vault_dir="$app_dir/infrastructure/hcp-vault"
    local cert_dir="$vault_dir/certs"
    local config_dir="$vault_dir/config"

    local ca_key="$cert_dir/ca.key"
    local ca_crt="$cert_dir/ca.crt"
    local srv_key="$cert_dir/vault.key"
    local srv_csr="$cert_dir/vault.csr"
    local srv_crt="$cert_dir/vault.crt"

    local csr_cnf="$config_dir/vault.csr.cnf"
    local ext_file="$config_dir/vault.ext"

    if [ ! -f "$ca_key" ]; then
      openssl genrsa -out "$ca_key" 4096

      openssl req -x509 -new -nodes -key "$ca_key" -sha256 -days 825 \
        -subj "/C=FR/ST=Local/L=Local/O=Transcendence/CN=Transcendence-Internal-CA" \
        -out "$ca_crt"
    fi

    if [ ! -f "$srv_key" ]; then
      openssl genrsa -out "$srv_key" 4096

      openssl req -new -key "$srv_key" -out "$srv_csr" -config "$csr_cnf"

      openssl x509 -req -in "$srv_csr" -CA "$ca_crt" -CAkey "$ca_key" -CAcreateserial \
        -out "$srv_crt" -days 825 -sha256 -extfile "$ext_file"
    fi
}

removeCertificates()
{
    rm -rf frontend/certs infrastructure/hcp-vault/certs
}

if [ $# -gt 0 ]; then
    checkNodeVersion
    case "$1" in
        "prod")
            mergePackageJson
            createFilesAndDirectories
            setupCertificates prod
        ;;

        "prod-clean")
            for directory in "${directories[@]}"; do
                cd $directory && rm -rf prod.package.json prod.tsconfig.json
            done
        ;;

        "local")
            checkPackageInstallation
            createFilesAndDirectories
            setupCertificates local
            export LOCAL=true
            export API_ORIGIN=http://localhost:3000
            cd $app_dir && npm run start:all
        ;;

        "local-watch")
            checkPackageInstallation
            createFilesAndDirectories
            cd $app_dir && npm run watch:all
        ;;

        "local-build")
            checkPackageInstallation
            createFilesAndDirectories
            cd $app_dir && npm install && npm run build:all
        ;;

        "local-clean")
            removeDirectories
            removeCertificates
            cd $app_dir && npm run clean && rm -rf node_modules package-lock.json
            for directory in "${directories[@]}"; do
                cd $directory && rm -rf node_modules package-lock.json prod.package.json prod.tsconfig.json
            done
        ;;

        "update")
            checkPackageUpdate
        ;;

        "upgrade")
            upgradePackage
        ;;
    esac
fi
