import { FastifyInstance } from "fastify";
import { Game } from "./objects.js";

export async function apiRoutes(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	apiGameManagement(fastify, games, gameConnections);
	apiGameControl(fastify, games, gameConnections);
}

export async function apiGameManagement(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.get("/api/game-engine/cli/create", async(request, reply) => {
		try {
			const match = {
				id: 'cli-match',
				players: [{"id": "cli-player1", "alias": "alice"},{"id": "cli-player2", "alias": "bob"}],
				mode: 'local',
				status: 'waiting'
			}
			const res = await fetch("http://localhost:3003/game-engine/start", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(match)
			});
			return {
				status: "success",
				gameId: match.id,
				message: "Local game created",
				players: match.players,
				mode: match.mode
			};
		} catch (error) {
			return {
				status: "error",
				message: "Failed to create game",
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	});

	// Get specific game details
	fastify.get("/api/game-engine/cli/:gameId", async(request, reply) => {
		const { gameId } = request.params as { gameId: string };
		const game = games.get(gameId);

		if (!game) {
			return {
				status: "error",
				message: "Game not found",
				gameId: gameId
			};
		}

		return {
			status: "success",
			gameId: gameId,
			mode: game.mode,
			players: game.players,
			ball: game.ball,
			paddles: game.paddles,
			score: game.score,
			paddleMovement: game.paddleMovement
		};
	});

	// Delete/End game
	fastify.delete("/api/game-engine/cli/:gameId", async(request, reply) => {
		const { gameId } = request.params as { gameId: string };
		
		if (games.has(gameId)) {
			games.delete(gameId);
			gameConnections.delete(gameId);
			
			return {
				status: "success",
				message: "Game ended",
				gameId: gameId
			};
		}

		return {
			status: "error", 
			message: "Game not found",
			gameId: gameId
		};
	});
}

// Improved Game Control Endpoints  
export async function apiGameControl(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {

	// Simplified movement controls
	fastify.get("/api/game-engine/cli/:gameId/move/:action", async(request, reply) => {
		const { gameId, action } = request.params as { gameId: string, action: string };
		const game = games.get(gameId);

		if (!game) {
			return {
				status: "error",
				message: "Game not found",
				gameId: gameId
			};
		}

		// Reset all movements first for clean state
		const resetMovements = () => {
			game.paddleMovement.leftUp = false;
			game.paddleMovement.leftDown = false;
			game.paddleMovement.rightUp = false;
			game.paddleMovement.rightDown = false;
		};

		// Apply movement based on action
		switch (action) {
			case "left-up":
				resetMovements();
				game.paddleMovement.leftUp = true;
				break;
			case "left-down":
				resetMovements();
				game.paddleMovement.leftDown = true;
				break;
			case "right-up":
				resetMovements();
				game.paddleMovement.rightUp = true;
				break;
			case "right-down":
				resetMovements();
				game.paddleMovement.rightDown = true;
				break;
			case "stop-all":
			case "stop":
				resetMovements();
				break;
			default:
				return {
					status: "error",
					message: "Invalid action",
					gameId: gameId,
					validActions: ["left-up", "left-down", "right-up", "right-down", "stop-all"]
				};
		}

		return {
			status: "success",
			gameId: gameId,
			action: action,
			message: `Applied ${action}`,
			currentMovement: game.paddleMovement
		};
	});
}