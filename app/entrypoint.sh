#!/bin/sh

set -e

jq -s 'reduce .[] as $item ({}; . * $item)' "tsconfig-global.json" "tsconfig-local.json" > tsconfig.json
jq -s 'reduce .[] as $item ({}; . * $item)' "package-global.json" "package-local.json" > package.json

rm tsconfig-global.json tsconfig-local.json package-global.json package-local.json

npm build

nginx -g daemon off