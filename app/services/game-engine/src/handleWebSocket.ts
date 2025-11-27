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

			let connections = gameConnections.get(gameId);
			console.log(chalk.blue(connections?.size));
			if (!connections) {
				connections = new Set<any>();
				gameConnections.set(gameId, connections);
			}
			connections.add(connection);
			playerside = resolvePlayerSide(game);
			console.log(chalk.red(`Player connected to game ${gameId}`));

			keyMovements(game, connection, playerside);

			function endGameOnLeave() {
				if (connections) connections.delete(connection);
				console.log(chalk.red(`Player disconnected from game ${gameId}`));
				if (!game || !connections) return;
				if (game.mode === 'remote2') {
					let winner = '';
					if (playerside === 'left') {
						winner = (game as any).aliasRight || 'right';
					} else if (playerside === 'right') {
						winner = (game as any).aliasLeft || 'left';
					} else {
						winner = 'adversaire';
					}
					connections.forEach((conn: any) => {
						conn.send(JSON.stringify({
							type: 'player_disconnected',
							winner
						}));
						conn.close();
					});
					gameConnections.delete(gameId);
					games.delete(gameId);
				} else if (game.mode === 'remote4') {
					connections.forEach((conn: any) => {
						conn.send(JSON.stringify({
							type: 'player_disconnected',
							winner: null
						}));
						conn.close();
					});
					gameConnections.delete(gameId);
					games.delete(gameId);
				}
			}
			connection.on('close', endGameOnLeave);

			connection.on('error',  (error:any) => {
				console.error(`Websocket error: ${error}`);
				endGameOnLeave();
			});

			connection.on('message', (message: any) => {
				try {
					const data = JSON.parse(message.toString());
					if (data.type === 'leave') {
						endGameOnLeave();
					}
				} catch (error) {}
			});

			connection.send(JSON.stringify({
				type: 'gameState',
				gameId,
				data: game
			}))
		})
	})
}
