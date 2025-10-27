IMAGE = reverse-proxy \
		authentication \
        api-gateway \
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

local:
	cd build && ./build.sh local

lclean:
	cd buld && ./build.sh lclean

clean: down

fclean: clean

re: clean all

.PHONY: all build up down local clean fclean re
