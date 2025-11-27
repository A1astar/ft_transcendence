IMAGE = reverse-proxy \
		authentication \
        gateway \
        game-orchestration

IMAGE := $(addprefix transcendence-, $(IMAGE))

COMPOSE_FILE=build/docker-compose.yml
REVERSE_PROXY=Dockerfile
REVERSE_PROXY_CONFIG_FILE=infrastructure/reverse-proxy/nginx.conf

all: clean build up

build:
	docker compose -f $(COMPOSE_FILE) build --no-cache

up:
	docker compose -f $(COMPOSE_FILE) up -d

down:
	docker compose -f $(COMPOSE_FILE) down --rmi local

reverse-proxy: build-reverse-proxy run-reverse-proxy

build-reverse-proxy:
# 	docker build -t reverse-proxy -f $(REVERSE_PROXY)
	docker build -t reverse-proxy -f Dockerfile .

run-reverse-proxy:
	docker run -d --name reverse-proxy -p 8443:443 transcendence-reverse-proxy

local-run: reverse-proxy
	cd build && ./build.sh local-run

local-watch: reverse-proxy
	cd build && ./build.sh local-watch

local-build: reverse-proxy
	cd build && ./build.sh local-build

local-clean:
	cd build && ./build.sh local-clean

local-re: local-clean local-run

clean: down

fclean: clean

re: clean all

.PHONY: all build up down local-run local-build local-clean local-re clean fclean re
