import { updateGame, updatePaddle } from "./movements.js";
import { Game } from "./objects.js";

const activeGameLoops = new Map<string, NodeJS.Timeout>();

export function startGameLoop(gameId: string, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	if (activeGameLoops.has(gameId))
		return;
	let lastTime = performance.now();
	const interval = setInterval(() => {
		const currentTime = performance.now();
		const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
		lastTime = currentTime;

		const game = games.get(gameId);
		const connections = gameConnections.get(gameId);

		if (!game || !connections) {
			clearInterval(interval);
			activeGameLoops.delete(gameId);
			return;
		}

		// Use deltaTime to ensure smooth movement regardless of frame timing
		updateGame(game);
		updatePaddle(game);

		// Only broadcast if there are active connections
		if (connections.size > 0) {
			broadcastGameState(gameId, game, connections);
		}
		
	}, 1000 / 60);
	activeGameLoops.set(gameId, interval);
}

// Cache for the last broadcast time
let lastBroadcastTime = 0;
const BROADCAST_INTERVAL = 1000 / 60; // Cap at 60 updates per second

export function broadcastGameState(gameId: string, game: Game, connections: Set<any>) {
	const currentTime = performance.now();
	
	// Throttle broadcasts to prevent overwhelming clients
	if (currentTime - lastBroadcastTime < BROADCAST_INTERVAL) {
		return;
	}
	
	lastBroadcastTime = currentTime;

	// Create a minimal state object with just the needed properties
	const minimalState = {
		type: "gameState",
		gameId,
		data: {
			ball: { x: game.ball.x, y: game.ball.y },
			paddles: {
				left: { x: game.paddles.left.x, y: game.paddles.left.y },
				right: { x: game.paddles.right.x, y: game.paddles.right.y },
				up: { x: game.paddles.up.x, y: game.paddles.up.y },
				down: { x: game.paddles.down.x, y: game.paddles.down.y }
			},
			score: game.score
		}
	};

	const message = JSON.stringify(minimalState);
	
	connections.forEach(socket => {
		if (socket && socket.readyState === 1)
			socket.send(message);			
	})
}

