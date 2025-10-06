IMAGE = reverse-proxy \
        api-gateway \
        game-orchestration

IMAGE := $(addprefix ft_transcendence-, $(IMAGE))

COMPOSE_FILE=./build/docker-compose.yml

all: clean build up

build:
	docker-compose -f $(COMPOSE_FILE) build --no-cache

up:
	docker-compose -f $(COMPOSE_FILE) up -d

down:
	docker-compose -f $(COMPOSE_FILE) down --rmi local

clean: down

fclean: clean

re: clean all

.PHONY: all build up down clean fclean re
