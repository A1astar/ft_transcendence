import { FastifyInstance } from "fastify";
import { Game } from "./objects";
import { startGameLoop } from "./gameLoop";


export async function initGame(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.post("/game-engine/start", async(request, reply) => {
	console.log(request.body);
	const { id: gameId } = request.body as { id : string };

	if (!gameId)
	  return { error: "no game id"};
	else if (games.has(gameId))
	  return {
		gameId,
		status: "already_running",
	};

	const game = new Game;
	games.set(gameId, game);
	gameConnections.set(gameId, new Set());

	startGameLoop(gameId, games, gameConnections);
	return {
		gameId,
		status: "started",
	};
	});
}