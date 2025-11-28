#!/bin/bash

cd /frontend

sed -i '/"extends": "..\/tsconfig.json",/d' tsconfig-local.json
jq -s 'reduce .[] as $item ({}; . * $item)' "tsconfig-global.json" "tsconfig-local.json" > tsconfig.json
jq -s 'reduce .[] as $item ({}; . * $item)' "package-global.json" "package-local.json" > package.json

rm tsconfig-global.json tsconfig-local.json package-global.json package-local.json

# # Load NVM if it exists
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# if ! command -v nvm &> /dev/null; then
#     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
#     export NVM_DIR="$HOME/.nvm"
#     [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# fi

# if ! command -v node &> /dev/null || [ "$(node --version)" != "v24.11.0" ]; then
#     nvm install 24.11.0
#     nvm use 24.11.0
# fi

ls -l
pwd
npm install
ls -l
npm start

nginx -g "daemon off;"