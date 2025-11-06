#!/bin/bash

set -e

project_dir=$(cd .. && pwd)
service_dir=$project_dir/services

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
    if ! command nvm &> /dev/null; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
        source "$HOME/.$(basename "$SHELL")rc"
    fi

    if ! node --version | grep "24.11.0"; then
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

if [ $# -gt 0 ]; then


    case "$1" in
        "local-run")
            checkNodeVersion
            checkPackageInstallation
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
            cd $project_dir && npm run clean
            for directory in "${directories[@]}"; do
                cd $directory && rm -rf node_modules package-lock.json
            done
        ;;
    esac
fi
