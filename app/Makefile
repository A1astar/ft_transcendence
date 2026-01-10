IMAGE = reverse-proxy \
        authentication \
        gateway \
        game-orchestration

IMAGE := $(addprefix transcendence-, $(IMAGE))
COMPOSE_FILE=./build/docker-compose.yml

# Set these variables for the vault
UID = $(shell id -u)
GID = $(shell id -g)
export UID
export GID

all: clean build up

build:
	./build/build.sh prod
	docker compose -f $(COMPOSE_FILE) build --no-cache
	./build/build.sh prod-clean

up:
	docker compose -f $(COMPOSE_FILE) up

down:
	docker compose -f $(COMPOSE_FILE) down --rmi local

local:
	./build/build.sh local

local-watch:
	./build/build.sh local-watch

local-build:
	./build/build.sh local-build

local-clean:
	./build/build.sh local-clean

local-re: local-clean local

clean: down local-clean

re: clean all

lint:
	npm run lint

format:
	npm run format

update:
	./build/build.sh update

upgrade:
	./build/build.sh upgrade

test:
	./test/script.sh

.PHONY: \
all setup-certs build up down \
local local-watch local-build local-clean local-watch-all local-re \
clean re lint format update upgrade test
