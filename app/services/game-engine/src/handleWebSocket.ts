import { FastifyInstance } from "fastify";
import { Game } from "./objects.js";
import chalk from 'chalk';


function resolvePlayerSide(game: Game): 'left' | 'right' | 'up' | 'down' | '' {
    if ((game.mode === 'remote2' || game.mode === 'remote4') && game.players.left === 0) {
        game.players.left = 1;
        return 'left';
    } else if ((game.mode === 'remote2' || game.mode === 'remote4') && game.players.left !== 0 && game.players.right === 0) {
        game.players.right = 1;
        return 'right';
    } else if (game.mode === 'remote4' && game.players.up === 0) {
		game.players.up = 1;
		return 'up';
	} else if (game.mode === 'remote4' && game.players.down === 0) {
		game.players.down = 1;
		return 'down';
	}
    return '';
}

function keyMovements(game: Game, connection: any, playerside: 'left' | 'right' | 'up' | 'down' | '') {
	connection.on('message', (message: any) => {
		try {
			const data = JSON.parse(message.toString());
			const { type, key } = data;

			if (type === 'keyPress') {
				if (game.mode === 'remote2') {
					if (key == 'w' && playerside === 'left')
						game.paddleMovement.leftUp = true;
					else if (key == 's' && playerside === 'left')
						game.paddleMovement.leftDown = true;
					else if (key == 'w' && playerside === 'right')
						game.paddleMovement.rightUp = true;
					else if (key == 's' && playerside === 'right')
						game.paddleMovement.rightDown = true;
				}
				else if (game.mode === 'remote4') {
					if (key == 'w' && playerside === 'left')
						game.paddleMovement.leftUp = true;
					else if (key == 's' && playerside === 'left')
						game.paddleMovement.leftDown = true;
					else if (key == 'w' && playerside === 'right')
						game.paddleMovement.rightUp = true;
					else if (key == 's' && playerside === 'right')
						game.paddleMovement.rightDown = true;
					else if (key == 'w' && playerside === 'up')
						game.paddleMovement.upLeft = true;
					else if (key == 's' && playerside === 'up')
						game.paddleMovement.upRight = true;
					else if (key == 'w' && playerside === 'down')
						game.paddleMovement.downRight = true;
					else if (key == 's' && playerside === 'down')
						game.paddleMovement.downLeft = true;
					}
				else {
					if (key == 'w')
						game.paddleMovement.leftUp = true;
					else if (key == 's')
						game.paddleMovement.leftDown = true;
					else if (key == 'p')
						game.paddleMovement.rightUp = true;
					else if (key == 'l')
						game.paddleMovement.rightDown = true;
				}
			}
			else if (type === 'keyRelease') {
				if (game.mode === 'remote2') {
					if (key == 'w' && playerside === 'left')
						game.paddleMovement.leftUp = false;
					else if (key == 's' && playerside === 'left')
						game.paddleMovement.leftDown = false;
					else if (key == 'w' && playerside === 'right')
						game.paddleMovement.rightUp = false;
					else if (key == 's' && playerside === 'right')
						game.paddleMovement.rightDown = false;
				}
				else if (game.mode === 'remote4') {
					if (key == 'w' && playerside === 'left')
						game.paddleMovement.leftUp = false;
					else if (key == 's' && playerside === 'left')
						game.paddleMovement.leftDown = false;
					else if (key == 'w' && playerside === 'right')
						game.paddleMovement.rightUp = false;
					else if (key == 's' && playerside === 'right')
						game.paddleMovement.rightDown = false;
					else if (key == 'w' && playerside === 'up')
						game.paddleMovement.upLeft = false;
					else if (key == 's' && playerside === 'up')
						game.paddleMovement.upRight = false;
					else if (key == 'w' && playerside === 'down')
						game.paddleMovement.downRight = false;
					else if (key == 's' && playerside === 'down')
						game.paddleMovement.downLeft = false;
					}
				else {
					if (key == 'w')
						game.paddleMovement.leftUp = false;
					else if (key == 's')
						game.paddleMovement.leftDown = false;
					else if (key == 'p')
						game.paddleMovement.rightUp = false;
					else if (key == 'l')
						game.paddleMovement.rightDown = false;
				}
			}
		} catch (error) {
			console.error('Invalid message', error);
		}
	})
}

export async function handleWebSocket(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.register(async function (fastify) {
		fastify.get('/api/game-engine/:gameId', {websocket:true}, (connection,req) => {
			const gameId = (req.params as any).gameId;
			let game = games.get(gameId);
			let playerside: 'left' | 'right' | 'up' | 'down' | '' = '';

			if (!game) {
				connection.send(JSON.stringify({error: "Match not found"}));
				connection.close();
				return;
			}

			// add connection to game
			let connections = gameConnections.get(gameId);
			console.log(chalk.blue(connections?.size));
			if (!connections) {
				connections = new Set<any>();
				gameConnections.set(gameId, connections);
			}
			connections.add(connection);

			// Try to assign side from orchestration-provided assignments when possible.
			// Prefer alias provided as a query param ?alias=xxx (frontends can add this),
			// otherwise fall back to the old resolvePlayerSide behavior.
			function getSideForAlias(alias: string): 'left' | 'right' | 'up' | 'down' | '' {
				if (!game || !game.playerAliases) return '';
				for (const side of ['left','right','up','down'] as const) {
					if ((game.playerAliases as any)[side] === alias) return side;
				}
				return '';
			}

			let alias: string | undefined = undefined;
			try {
				// log the incoming websocket request url/query so we can debug alias parsing for players
				try {
					console.log(chalk.yellow(`WS connect URL: ${JSON.stringify((req as any).url ?? (req as any).raw?.url ?? '<unknown>')}`));
					console.log(chalk.yellow(`WS connect parsed query: ${JSON.stringify((req as any).query ?? {})}`));
				} catch (e) {
					// best-effort logging
				}
				alias = (req.query as any)?.alias;
			} catch (e) {
				// ignore if query parsing not available
			}

			if (alias) {
				const assignedSide = getSideForAlias(alias);
				if (assignedSide) {
					// if the side is free, occupy it and use it for this connection
					if ((game as any).players[assignedSide] === 0) {
						(game as any).players[assignedSide] = 1;
						playerside = assignedSide;
						
					}
				}
			}

			if (!playerside) {
				playerside = resolvePlayerSide(game);
			}
			// console.log(chalk.blue(game.mode + ' ' + playerside));

			// Determine which alias corresponds to the assigned side for logging
			let sideAlias: string | undefined = undefined;
			try {
				sideAlias = alias ?? ((game.playerAliases as any)?.[playerside]);
			} catch (e) {
				// ignore
			}

			console.log(chalk.green(`Player assigned side: ${playerside}`));
			console.log(chalk.green(`Player alias for side: ${sideAlias ?? '<none>'}`));
			console.log(chalk.red(`Player connected to game ${gameId}`));

			// handle keypress event
			keyMovements(game, connection, playerside);

			// close websocket
			connection.on('close', () => {
				connections.delete(connection);
				console.log(chalk.red(`Player disconnected from game ${gameId}`));
			})

			// handle error
			connection.on('error',  (error:any) => {
				console.error(`Websocket error: ${error}`);
				connections.delete(connection);
			})

			// send ws reply
			connection.send(JSON.stringify({
				type: 'gameState',
				gameId,
				data: game
			}))
		})
	})
}
