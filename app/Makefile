IMAGE = reverse-proxy \
		authentication \
        gateway \
        game-orchestration \
		reverse-proxy

IMAGE := $(addprefix transcendence-, $(IMAGE))

COMPOSE_FILE=build/docker-compose.yml
REVERSE_PROXY=Dockerfile
REVERSE_PROXY_CONFIG_FILE=infrastructure/reverse-proxy/nginx.conf

all: clean build up

prod:
	docker compose -f $(COMPOSE_FILE)

build:
	docker compose -f $(COMPOSE_FILE) build --no-cache

up:
	docker compose -f $(COMPOSE_FILE) up -d

down:
	docker compose -f $(COMPOSE_FILE) down --rmi local

reverse-proxy: build-reverse-proxy run-reverse-proxy
	cd build && ./build.sh reverse-proxy

build-reverse-proxy:
	docker rm -f $(docker ps -a -q) || true
	docker rmi -f reverse-proxy || true
	cp package.json frontend/package-global.json
	cp tsconfig.json frontend/tsconfig-global.json
	cp frontend/package.json frontend/package-local.json
	cp frontend/tsconfig.json frontend/tsconfig-local.json
	docker build -t reverse-proxy -f Dockerfile . --no-cache

run-reverse-proxy:
	@echo here
	rm frontend/tsconfig-local.json frontend/tsconfig-global.json
	rm frontend/package-local.json frontend/package-global.json
	-docker rm -f reverse-proxy || true
	docker run -d --name reverse-proxy -p 8443:443 reverse-proxy

local-run:
	cd build && ./build.sh local-run

local-watch:
	cd build && ./build.sh local-watch

local-build:
	cd build && ./build.sh local-build

local-clean:
	cd build && ./build.sh local-clean

local-re: local-clean local-run

clean: down

fclean: clean

re: clean all

.PHONY: all build up down local-run local-build local-clean local-re clean fclean re
