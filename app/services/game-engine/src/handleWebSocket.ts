import { FastifyInstance } from "fastify";
import { Game } from "./objects";
import { paddleMoveDown, paddleMoveUp } from "./movements";


export function handleWebSocket(fastify: FastifyInstance, games: Map<string, Game>, gameConnections: Map<string, Set<any>>) {
	fastify.register(async function (fastify) {
		fastify.get('/game/:gameId', {websocket:true}, (conn,req) => {
			const gameId = (req.params as any).gameId;
			const game = games.get(gameId);

			if (!game) {
				conn.socket.send(JSON.stringify({error: "Match not sound"}));
				conn.socket.close();
				return;
			}

			// add connection to game
			let connections = gameConnections.get(gameId);
			if (!connections) {
				connections = new Set<any>();
				gameConnections.set(gameId, connections);
			}
			connections.add(conn.socket);
			console.log(`Player connected to game ${gameId} on ${conn}`);

			// handle keypress event
			conn.socket.on('message', (message: any) => {
				try {
					const data = JSON.parse(message.toString());
					const { type, key } = data;
				
					if (type === 'keyPress') {
						if (key == 'w')
							paddleMoveUp(game, "left");
						else if (key == 's')
							paddleMoveDown(game, "left");
						else if (key == 'p')
							paddleMoveUp(game, "right");
						else if (key == 'l')
							paddleMoveDown(game, "right");						
					}
				} catch (error) {
					console.error('Invalide message', error);
				}
			})
			
			// close websocket
			conn.socket.on('close', () => {
				connections.delete(conn.socket);
				console.log(`Player disconnected from game ${gameId} on ${conn}`);
			})

			// send ws reply
			conn.socket.send(JSON.stringify({
				type: 'gameState',
				gameId,
				data: game
			}))

		})
	})
}