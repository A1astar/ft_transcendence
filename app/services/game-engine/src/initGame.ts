import { FastifyInstance } from "fastify";
import { Game } from "./objects.js";
import { startGameLoop } from "./gameLoop.js";
import chalk from 'chalk';


export async function initGame(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.post("/game-engine/start", async(request, reply) => {
	const { id: gameId } = request.body as { id : string };
	const { mode } = request.body as { mode : string };
    // read optional assignments map from orchestration (side -> alias)
    const { assignments } = request.body as { assignments?: Record<string, string> };

	if (!gameId)
	  return { error: "no game id"};
	else if (games.has(gameId))
	  return {
		gameId,
		status: "already_running",
	};

	const game = new Game;
	game.mode = mode;
	if (assignments) {
		game.playerAliases = assignments;
	}
	if (mode === 'remote4')
		game.score = { left: 5, right: 5, up: 5, down: 5 }
	games.set(gameId, game);
	gameConnections.set(gameId, new Set());

	startGameLoop(gameId, games, gameConnections);
	return {
		gameId,
		status: "started",
	};
	});
}