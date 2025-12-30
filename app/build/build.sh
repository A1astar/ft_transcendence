#!/bin/bash

set -e

app_dir=$(pwd)
service_dir=$app_dir/services
frontend_dir=$app_dir/frontend

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
    [ ! -d node_modules ] && npm install
}

checkPackageUpdate()
{
    cd $app_dir && npx npm-check-updates
    for directory in "${directories[@]}"; do
        cd $directory && npx npm-check-updates
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

if [ $# -gt 0 ]; then
    case "$1" in
        "prod")
            checkNodeVersion
            mergePackageJson
        ;;

        "local")
            checkNodeVersion
            checkPackageInstallation
            export LOCAL=true
            export API_ORIGIN=http://localhost:3000
            cd $app_dir && npm run start:all
        ;;

        "local-watch")
            checkNodeVersion
            checkPackageInstallation
            cd $app_dir && npm run watch:all
        ;;

        "local-build")
            checkNodeVersion
            checkPackageInstallation
            cd $app_dir && npm install && npm run build:all
        ;;

        "local-clean")
            rm -rf ../frontend/certs
            cd $app_dir && npm run clean && rm -rf node_modules package-lock.json
            for directory in "${directories[@]}"; do
                cd $directory && rm -rf node_modules package-lock.json prod.package.json prod.tsconfig.json
            done
        ;;

        "frontend-build")
            checkNodeVersion
            cd "$frontend_dir"
            checkPackageInstallation
            npm run build
        ;;

        "frontend-serve")
            checkNodeVersion
            cd "$frontend_dir"
            checkPackageInstallation
            # This runs the HTTPS + WSS dev server defined in frontend/package.json
            npm run serve
        ;;

        "update")
            checkNodeVersion
            checkPackageUpdate
        ;;
    esac
fi
