IMAGE = reverse-proxy \
		authentication \
        gateway \
        game-orchestration

IMAGE := $(addprefix transcendence-, $(IMAGE))

COMPOSE_FILE=./build/docker-compose.yml
PROJECT_DIR := $(abspath .)
FRONTEND_DIR := $(PROJECT_DIR)/frontend

all: clean local-build setup-certs frontend-build build up

setup-certs:
	@mkdir -p $(FRONTEND_DIR)/certs
	@if [ ! -f $(FRONTEND_DIR)/certs/self.key ]; then \
		echo "Generating SSL certificates..."; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout $(FRONTEND_DIR)/certs/self.key \
		-out $(FRONTEND_DIR)/certs/self.crt \
		-subj "/C=TW/ST=Taipei/L=Taipei/O=42/OU=Transcendence/CN=localhost"; \
	fi

build:
	docker compose -f $(COMPOSE_FILE) build --no-cache

up:
	docker compose -f $(COMPOSE_FILE) build reverse-proxy
	docker compose -f $(COMPOSE_FILE) up

down:
	docker compose -f $(COMPOSE_FILE) down --rmi local

# Temporary rules to implement hcp-vault (will be removed later)
vault: vault-clean vault-build vault-up

vault-build:
	mkdir ./infrastructure/hcp-vault/data
	docker build -t transcendence-hcp-vault ./infrastructure/hcp-vault --no-cache

vault-up:
	docker run	-d --name transcendence-hcp-vault \
				-p 8200:8200 \
				-v ./infrastructure/hcp-vault/data:/vault/data \
				transcendence-hcp-vault

vault-down:
	docker stop transcendence-hcp-vault || true
	docker rm transcendence-hcp-vault || true

vault-clean: vault-down
	docker rmi transcendence-hcp-vault || true
	@if [ -d ./infrastructure/hcp-vault/data ]; then \
		rm -rf ./infrastructure/hcp-vault/data; \
	fi \

local-run:
	cd build && ./build.sh local-run

local-watch:
	cd build && ./build.sh local-watch

local-build:
	cd build && ./build.sh local-build

local-clean:
	cd build && ./build.sh local-clean

# ---- Frontend shortcuts (no more manual npm commands) ----
frontend-install:
	cd build && ./build.sh frontend-install

frontend-build:
	cd build && ./build.sh frontend-build

frontend-serve:
	cd build && ./build.sh frontend-serve

# Run backend watchers + HTTPS/WSS dev server together
local-watch-all:
	$(MAKE) -j2 local-watch frontend-serve

local-re: local-clean local-run

clean: down
	docker rmi || true

re: clean all

test:
	cd test && ./script.sh

.PHONY: \
all setup-certs build up down \
local-run local-watch local-build local-clean local-watch-all local-re \
frontend-install frontend-build frontend-serve \
clean re test
