IMAGE=api-gateway \
      game-orchestration
IMAGE:= $(addprefix ft_transcendence-, $(IMAGE))


COMPOSE_FILE=./build/docker-compose.yml

all: build up

build:
	docker-compose -f $(COMPOSE_FILE) build --no-cache

up:
	docker-compose -f $(COMPOSE_FILE) up -d

down:
	docker-compose -f $(COMPOSE_FILE) down

clean: down
	docker image rm $(IMAGE)

.PHONY: all build up down
