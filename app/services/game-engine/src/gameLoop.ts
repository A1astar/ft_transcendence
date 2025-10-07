import { updateGame, updatePaddle } from "./movements";
import { Game } from "./objects";

const activeGameLoops = new Map<string, NodeJS.Timeout>();

export function startGameLoop(gameId: string, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	if (activeGameLoops.has(gameId))
		return;
	const interval = setInterval(() => {
		const game = games.get(gameId);
		const connections = gameConnections.get(gameId);

		if (!game || !connections || connections.size === 0) {
			clearInterval(interval);
			activeGameLoops.delete(gameId);
			return;
		}

		updateGame(game);
		updatePaddle(game);
		broadcastGameState(gameId, game, connections);
		
	}, 1000 / 60);
	activeGameLoops.set(gameId, interval);
}

export function broadcastGameState(gameId: string, game: Game, connections: Set<any>) {
	const message = JSON.stringify({
		type: "gameState",
		gameId,
		data: game
	});
	connections.forEach(socket => {
		if (socket && socket.readyState === 1)
			socket.send(message);			
	})
}

