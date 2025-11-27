#!/bin/bash

project_dir=$(cd .. && pwd)
service_dir=$project_dir/services
services=(
    "$service_dir/authentication"
    "$service_dir/game-engine"
    "$service_dir/game-orchestration"
    "$service_dir/gateway"
)

# for service in ${service_dir[@]}; do
    # Merge package.json

# done
