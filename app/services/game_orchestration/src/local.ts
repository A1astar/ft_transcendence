
// import Fastify from "fastify";
// import cors from "@fastify/cors";
// import { randomUUID } from "crypto";

// const fastify = Fastify({ logger: true });

// // Enable CORS (allow connections from frontend or other services)
// fastify.register(cors, {
//   origin: "*"
// });

// fastify.post("/matchmaking/local", async(req, reply) => {
// 	const player = req.body as Player;
// 	queues.local.push(player);

// 	if (queues.local.length == 2) {
// 		const matchPlayers = queues.local.splice(0,2);
// 		const match: Match = {
// 			id: crypto.randomUUID(),
// 			players: matchPlayers,
// 			mode: "local",
// 			tournament_id: 0,
// 			status: "waiting"
// 		};
// 		return match;
// 	}
// 	return {status: "waiting"};
// })