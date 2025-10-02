#!/bin/bash

set -e

project_dir=$(cd .. && pwd)
service_dir=$project_dir/services

if [ $# -gt 0 ]; then
    case "$1" in
        "api-gateway")
            services="$service_dir/api-gateway"
        ;;
        "game-orchestration")
            "$service_dir/game-orchestration"
        ;;
        default)
            services=(
                "$service_dir/api-gateway"
                "$service_dir/game-orchestration"
            )
        ;;
    esac
fi

# until our docker-compose is implemented:
for service in "${services[@]}"; do
    # docker build $service/Dockerfile.node -t ft_transcendence-api-gateway
    echo $service
    cd $service
    npm install
    npx node index.js &
done