#!/bin/bash

set -e

project_dir=$(cd .. && pwd)
service_dir=$project_dir/services
frontend_dir=$project_dir/frontend

directories=(
    "$project_dir/"
    "$project_dir/frontend"
    "$project_dir/services/authentication"
    "$project_dir/services/game-engine"
    "$project_dir/services/game-orchestration"
    "$project_dir/services/gateway"
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
    for directory in "${directories[@]}"; do
        cd $directory && npx npm-check-updates
    done
}

mergePackageJson()
{
    return
}

if [ $# -gt 0 ]; then
    case "$1" in
        "prod")
            checkNodeVersion
        ;;

        "local")
            checkNodeVersion
            checkPackageInstallation
            export LOCAL_DEV=true
            export API_ORIGIN=http://localhost:3000
            cd $project_dir && npm run start:all
        ;;

        "local-watch")
            checkNodeVersion
            checkPackageInstallation
            cd $project_dir && npm run watch:all
        ;;

        "local-build")
            checkNodeVersion
            checkPackageInstallation
            cd $project_dir && npm install && npm run build:all
        ;;

        "local-clean")
            rm -rf ../frontend/certs
            cd $project_dir && npm run clean
            for directory in "${directories[@]}"; do
                cd $directory && rm -rf node_modules package-lock.json
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
