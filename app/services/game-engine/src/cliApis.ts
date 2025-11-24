import { FastifyInstance } from "fastify";
import { Game, Player } from "./objects.js";
import { authenticate, JWTPayload } from "./auth.js";

export async function apiRoutes(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	apiGameManagement(fastify, games, gameConnections);
	apiGameControl(fastify, games, gameConnections);
}

export async function apiGameManagement(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	// Create a local game (for testing purposes)
	// Optional authentication - if token provided, use it; otherwise create anonymous game
	fastify.get("/api/game-engine/cli/create", async(request, reply) => {
		try {
			// Try to get user from token if available
			let user: JWTPayload | null = null;
			try {
				await request.jwtVerify();
				user = (request as any).user as JWTPayload;
			} catch (err) {
				// No token or invalid token - create anonymous game
				user = null;
			}

			const match = {
				id: 'cli-match',
				players: user 
					? [
						{"id": user.userId, "alias": user.name},
						{"id": "cli-player2", "alias": "AI Opponent"}
					]
					: [
						{"id": "cli-player1", "alias": "alice"},
						{"id": "cli-player2", "alias": "bob"}
					],
				mode: 'local',
				status: 'waiting'
			}
			const res = await fetch("http://localhost:3003/game-engine/start", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(match)
			});
			
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				reply.code(res.status || 500);
				throw new Error(errorData.error || `Failed to start game: ${res.statusText}`);
			}

			return {
				status: "success",
				gameId: match.id,
				message: "Local game created",
				players: match.players,
				mode: match.mode
			};
		} catch (error) {
			reply.code(500);
			throw error;
		}
	});

	// Get specific game details (JWT authentication temporarily disabled for testing)
	fastify.get("/api/game-engine/cli/:gameId", {
		// preHandler: [authenticate], // Temporarily disabled
		schema: {
			params: {
				type: 'object',
				required: ['gameId'],
				properties: {
					gameId: { type: 'string', minLength: 1 }
				}
			}
		}
	}, async(request, reply) => {
		const { gameId } = request.params as { gameId: string };
		// const user = (request as any).user as JWTPayload; // Temporarily disabled
		const game = games.get(gameId);

		if (!game) {
			reply.code(404);
			throw new Error(`Game not found: ${gameId}`);
		}

		// Player verification temporarily disabled for testing
		// const isPlayer = game.playerList.length > 0 
		// 	? game.playerList.some((p: Player) => p.id === user.userId)
		// 	: true;
		// if (!isPlayer) {
		// 	reply.code(403);
		// 	throw new Error("Forbidden: You are not a player in this game");
		// }

		return {
			status: "success",
			gameId: gameId,
			mode: game.mode,
			players: game.playerList.length > 0 ? game.playerList : game.players,
			ball: game.ball,
			paddles: game.paddles,
			score: game.score,
			paddleMovement: game.paddleMovement
		};
	});

	// Join match queue to play against web users (JWT authentication temporarily disabled for testing)
	fastify.post("/api/game-engine/cli/match", {
		// preHandler: [authenticate] // Temporarily disabled
	}, async(request, reply) => {
		// User info temporarily disabled for testing
		// const user = (request as any).user as JWTPayload;
		// if (!user) {
		// 	reply.code(401);
		// 	throw new Error("Unauthorized: User information not found");
		// }

		// Use default values for testing
		const userId = "cli-test-user";
		const userName = "CLI Test User";

		// Join remote2 queue through Game Orchestration
		const matchRequest = {
			player: {
				id: userId,
				alias: userName
			}
		};

		try {
			const res = await fetch("http://localhost:3002/api/game-orchestration/remote2", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(matchRequest)
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				reply.code(res.status || 500);
				throw new Error(errorData.error || `Failed to join match queue: ${res.statusText}`);
			}

			const matchResult = await res.json();

			if (matchResult.status === "waiting") {
				return {
					status: "waiting",
					message: "Waiting for opponent...",
					playerAlias: userName
				};
			} else if (matchResult.id) {
				// Match found
				return {
					status: "matched",
					gameId: matchResult.id,
					match: matchResult,
					message: "Match found!"
				};
			} else {
				reply.code(500);
				throw new Error(matchResult.error || "Unknown error from game orchestration");
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes("Failed to join")) {
				throw error;
			}
			reply.code(500);
			throw new Error(`Failed to join match queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	});

	// Delete/End game (JWT authentication temporarily disabled for testing)
	fastify.delete("/api/game-engine/cli/:gameId", {
		// preHandler: [authenticate], // Temporarily disabled
		schema: {
			params: {
				type: 'object',
				required: ['gameId'],
				properties: {
					gameId: { type: 'string', minLength: 1 }
				}
			}
		}
	}, async(request, reply) => {
		const { gameId } = request.params as { gameId: string };
		// const user = (request as any).user as JWTPayload; // Temporarily disabled
		const game = games.get(gameId);
		
		if (!game) {
			reply.code(404);
			throw new Error(`Game not found: ${gameId}`);
		}

		// Player verification temporarily disabled for testing
		// const isPlayer = game.playerList.length > 0 
		// 	? game.playerList.some((p: Player) => p.id === user.userId)
		// 	: true;
		// if (!isPlayer) {
		// 	reply.code(403);
		// 	throw new Error("Forbidden: You are not a player in this game");
		// }

		games.delete(gameId);
		gameConnections.delete(gameId);
		
		return {
			status: "success",
			message: "Game ended",
			gameId: gameId
		};
	});
}

// Improved Game Control Endpoints  
export async function apiGameControl(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {

	// Simplified movement controls (JWT authentication temporarily disabled for testing)
	const validActions = ["left-up", "left-down", "right-up", "right-down", "stop-left", "stop-right", "stop-all", "stop"];
	
	fastify.get("/api/game-engine/cli/:gameId/move/:action", {
		// preHandler: [authenticate], // Temporarily disabled
		schema: {
			params: {
				type: 'object',
				required: ['gameId', 'action'],
				properties: {
					gameId: { type: 'string', minLength: 1 },
					action: { 
						type: 'string',
						enum: validActions
					}
				}
			}
		}
	}, async(request, reply) => {
		const { gameId, action } = request.params as { gameId: string, action: string };
		
		// User verification temporarily disabled for testing
		// const user = (request as any).user as JWTPayload;
		const game = games.get(gameId);

		if (!game) {
			reply.code(404);
			throw new Error(`Game not found: ${gameId}`);
		}

		// Player verification temporarily disabled for testing
		// const isPlayer = game.playerList.length > 0 
		// 	? game.playerList.some((p: Player) => p.id === user.userId)
		// 	: true;
		// if (!isPlayer) {
		// 	reply.code(403);
		// 	throw new Error("Forbidden: You are not a player in this game");
		// }

		// Apply movement based on action
		// Note: We don't reset all movements to allow for continuous movement
		// The movement flags remain true until explicitly stopped
		switch (action) {
			case "left-up":
				game.paddleMovement.leftUp = true;
				game.paddleMovement.leftDown = false;
				break;
			case "left-down":
				game.paddleMovement.leftUp = false;
				game.paddleMovement.leftDown = true;
				break;
			case "right-up":
				game.paddleMovement.rightUp = true;
				game.paddleMovement.rightDown = false;
				break;
			case "right-down":
				game.paddleMovement.rightUp = false;
				game.paddleMovement.rightDown = true;
				break;
			case "stop-left":
				game.paddleMovement.leftUp = false;
				game.paddleMovement.leftDown = false;
				break;
			case "stop-right":
				game.paddleMovement.rightUp = false;
				game.paddleMovement.rightDown = false;
				break;
			case "stop-all":
			case "stop":
				game.paddleMovement.leftUp = false;
				game.paddleMovement.leftDown = false;
				game.paddleMovement.rightUp = false;
				game.paddleMovement.rightDown = false;
				break;
			default:
				reply.code(400);
				throw new Error(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
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