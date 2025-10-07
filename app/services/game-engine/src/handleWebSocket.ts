import { FastifyInstance } from "fastify";
import { Game } from "./objects";
import chalk from 'chalk';


export function handleWebSocket(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.register(async function (fastify) {
		fastify.get('/game-engine/:gameId', {websocket:true}, (connection,req) => {
			const gameId = (req.params as any).gameId;
			let game = games.get(gameId);

			if (!game) {
				connection.send(JSON.stringify({error: "Match not found"}));
				connection.close();
				return;
			}

			// add connection to game
			let connections = gameConnections.get(gameId);
			if (!connections) {
				connections = new Set<any>();
				gameConnections.set(gameId, connections);
			}
			connections.add(connection);
			console.log(chalk.red(`Player connected to game ${gameId}`));

			// handle keypress event
			connection.on('message', (message: any) => {
				try {
					const data = JSON.parse(message.toString());
					const { type, key } = data;
				
					if (type === 'keyPress') {
						console.log(`keypressed: ${key}`)
						if (key == 'w')
							game.paddleMovement.leftUp = true;
						else if (key == 's')
							game.paddleMovement.leftDown = true;
						else if (key == 'p')
							game.paddleMovement.rightUp = true;
						else if (key == 'l')
							game.paddleMovement.rightDown = true;
					}
					else if (type === 'keyRelease') {
						console.log(`keyreleased: ${key}`)
						if (key == 'w')
							game.paddleMovement.leftUp = false;
						else if (key == 's')
							game.paddleMovement.leftDown = false;
						else if (key == 'p')
							game.paddleMovement.rightUp = false;
						else if (key == 'l')
							game.paddleMovement.rightDown = false;
					}
				} catch (error) {
					console.error('Invalid message', error);
				}
			})
			
			// close websocket
			connection.on('close', () => {
				connections.delete(connection);
				console.log(`Player disconnected from game ${gameId} on ${connection}`);
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