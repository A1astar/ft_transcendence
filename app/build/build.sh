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

if [ $# -gt 0 ]; then
    case "$1" in
        "local-run")
            cd $project_dir && npm run start:all
        ;;

        "local-build")
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
