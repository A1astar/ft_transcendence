#!/bin/bash

set -e

project_dir=$(cd .. && pwd)
service_dir=$project_dir/services

directories=(
    "$project_dir/frontend"
    "$project_dir/services/api-gateway"
    "$project_dir/services/authentication"
    "$project_dir/services/game-engine"
    "$project_dir/services/game-orchestration"
)

if [ $# -gt 0 ]; then
    case "$1" in
        "local-run")
            cmd="npm start"
        ;;

        "local-build")
            cmd="npm install && npx sort-package-json"
        ;;

        "local-clean")
            cmd="npm run clean && rm -rf node_modules package-lock.json"
        ;;
    esac
fi

for directory in "${directories[@]}"; do
    cd $directory && bash -c "$cmd"
done
