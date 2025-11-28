IMAGE = reverse-proxy \
		authentication \
        gateway \
        game-orchestration

IMAGE := $(addprefix transcendence-, $(IMAGE))

COMPOSE_FILE=./build/docker-compose.yml
PROJECT_DIR := $(abspath .)
FRONTEND_DIR := $(PROJECT_DIR)/frontend

all: clean local-build setup-certs build up

setup-certs:
	@mkdir -p $(FRONTEND_DIR)/certs
	@if [ ! -f $(FRONTEND_DIR)/certs/self.key ]; then \
		echo "Generating SSL certificates..."; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout $(FRONTEND_DIR)/certs/self.key \
		-out $(FRONTEND_DIR)/certs/self.crt \
		-subj "/C=TW/ST=Taipei/L=Taipei/O=42/OU=Transcendence/CN=localhost"; \
	fi

build: setup-certs frontend-build
	docker compose -f $(COMPOSE_FILE) build --no-cache

up: setup-certs frontend-build
	docker compose -f $(COMPOSE_FILE) build reverse-proxy
	docker compose -f $(COMPOSE_FILE) up -d

down:
	docker compose -f $(COMPOSE_FILE) down --rmi local

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

fclean: clean

re: clean all

.PHONY: all build up down local-run local-watch local-build local-clean local-watch-all local-re clean fclean re setup-certs frontend-install frontend-build frontend-serve
