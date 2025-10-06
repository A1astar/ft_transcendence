import Fastify, { FastifyInstance } from "fastify";
import { Player, Match, queues } from "./objects.js";
import { createMatch } from "./utils.js"


export default async function tournamentMatch(fastify: FastifyInstance) {
  fastify.post("/game-orchestration/tournament", async(request, reply) => {
	const player = request.body as Player;
	queues.tournament.push(player);

	if (queues.tournament.length == 4) {
	  const matchPlayers1 = queues.tournament.splice(0,2);
	  const match1: Match = createMatch(matchPlayers1, "tournament", 1);
	  const res1 = fetch("http://localhost:3002/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match1)
	  });
	  const matchPlayers2 = queues.tournament.splice(0,2);
	  const match2: Match = createMatch(matchPlayers2, "tournament", 2);
	  const res2 = fetch("http://localhost:3002/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match2)
	  });

	  return {status: "game created"};
	}
	return {status: "waiting"};
  })
}
