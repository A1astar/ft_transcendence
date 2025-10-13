import { FastifyInstance } from "fastify";
import { Game } from "./objects.js";
import chalk from 'chalk';


function resolvePlayerSide(game: Game): 'left' | 'right' | 'up' | 'down' | '' {
    if (game.mode === 'remote2' && game.players.left === 0) {
        game.players.left = 1;
        return 'left';
    } else if (game.mode === 'remote2' && game.players.left !== 0 && game.players.right === 0) {
        game.players.right = 1;
        return 'right';
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
					else if (key == 'p' && playerside === 'right')
						game.paddleMovement.rightUp = true;
					else if (key == 'l' && playerside === 'right')
						game.paddleMovement.rightDown = true;					
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
					else if (key == 'p' && playerside === 'right')
						game.paddleMovement.rightUp = false;
					else if (key == 'l' && playerside === 'right')
						game.paddleMovement.rightDown = false;					
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
		fastify.get('/game-engine/:gameId', {websocket:true}, (connection,req) => {
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
			playerside = resolvePlayerSide(game);
			// console.log(chalk.blue(game.mode + ' ' + playerside));
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