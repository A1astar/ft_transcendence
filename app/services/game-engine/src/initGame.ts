import { FastifyInstance } from "fastify";
import { Game, Player } from "./objects.js";
import { startGameLoop } from "./gameLoop.js";
import chalk from 'chalk';


export async function initGame(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.post("/game-engine/start", async(request, reply) => {
	const body = request.body as { id : string; mode : string; players?: Player[] };
	const { id: gameId, mode, players } = body;

	if (!gameId)
	  return { error: "no game id"};
	else if (games.has(gameId))
	  return {
		gameId,
		status: "already_running",
	};

	const game = new Game;
	game.mode = mode;
	if (mode === 'remote4')
		game.score = { left: 5, right: 5, up: 5, down: 5 }
	
	// Store player list (if provided)
	if (players && Array.isArray(players)) {
		game.playerList = players;
	}
	
	games.set(gameId, game);
	gameConnections.set(gameId, new Set());

	startGameLoop(gameId, games, gameConnections);
	return {
		gameId,
		status: "started",
	};
	});
}