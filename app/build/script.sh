#!/bin/bash

set -e

project_dir=$(cd .. && pwd)
service_dir=$project_dir/services
services=(
    "$service_dir/api-gateway"
    "$service_dir/game-engine"
    "$service_dir/user-management"
    "$service_dir/matchmaking"
)

# until our docker-compose is implemented:
for service in "${services[@]}"; do
    # docker build $service/Dockerfile.node -t ft_transcendence-api-gateway
    echo $service
    cd $service
    npm install
    npx node index.js &
done