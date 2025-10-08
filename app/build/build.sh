#!/bin/bash

set -e

project_dir=$(cd .. && pwd)
service_dir=$project_dir/services

if [ $# -gt 0 ]; then
    case "$1" in
        "api-gateway")
            services="$service_dir/api-gateway"
        ;;
        "authentication")
            services="$service_dir/authentication"
        ;;
        "game-engine")
            services="$service_dir/game-engine"
        ;;
        "game-orchestration")
            services="$service_dir/game-orchestration"
        ;;
        default)
            services=(
                "$service_dir/api-gateway"
                "$service_dir/authentication"
                "$service_dir/game-engine"
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
done