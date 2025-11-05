IMAGE = reverse-proxy \
		authentication \
        gateway \
        game-orchestration

IMAGE := $(addprefix transcendence-, $(IMAGE))

COMPOSE_FILE=./build/docker-compose.yml

all: clean build up

build:
	docker-compose -f $(COMPOSE_FILE) build --no-cache

up:
	docker-compose -f $(COMPOSE_FILE) up -d

down:
	docker-compose -f $(COMPOSE_FILE) down --rmi local

local-run:
	cd build && ./build.sh local-run

local-build:
	cd build && ./build.sh local-build

local-clean:
	cd build && ./build.sh local-clean

clean: down

fclean: clean

re: clean all

.PHONY: all build up down local clean fclean re
