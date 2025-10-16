import { FastifyInstance } from "fastify";
import { Game } from "./objects.js";

export async function apiRoutes(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	apiGetGameState(fastify, games, gameConnections);
	apiUserInput(fastify, games, gameConnections);
}

export async function apiUserInput(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.post("/api/game-engine/input/:gameId", async(request, reply) => {
	console.log(request.body);	
	const { id: gameId } = request.body as { id : string };
	let game = games.get(gameId);
	const { keyType } = request.body as { keyType : "press" | "release" };
	const { key } = request.body as { key : string };
	if (game && keyType == "press" && key == ' w')
		game.paddleMovement.leftUp = true;
	else if (game && keyType == "press" && key == 's')
		game.paddleMovement.leftDown = true;
	else if (game && keyType == "press" && key == 'p')
		game.paddleMovement.rightUp = true;
	else if (game && keyType == "press" && key == 'l') 
		game.paddleMovement.rightDown = true;
	else if (game && keyType == "release" && key == ' w')
		game.paddleMovement.leftUp = false;
	else if (game && keyType == "release" && key == 's')
		game.paddleMovement.leftDown = false;
	else if (game && keyType == "release" && key == 'p')
		game.paddleMovement.rightUp = false;
	else if (game && keyType == "release" && key == 'l') 
		game.paddleMovement.rightDown = false;
	return {
		gameId,
		move: `key ${keyType} : ${key}`,
	};
	});
}

export async function apiGetGameState(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.post("/api/game-engine/game-state/:gameId", async(request, reply) => {
	console.log(request.body);
	const { id: gameId } = request.body as { id : string };
	let game = games.get(gameId);

	if (game) {
		return {
			gameId,
			ball: (game.ball),
			paddes: (game.paddles),
			score: (game.score),
		};		
	}
	});
}