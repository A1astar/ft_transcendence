import { FastifyInstance } from "fastify";
import { Player, MatchRequest, Match, queues } from "./objects.js";
import { createMatch } from "./utils.js"


export async function testMatch(fastify: FastifyInstance) {
  fastify.post("/game-orchestration/test", async(request, reply) => {
	const matchRequest = request.body as MatchRequest;
	queues.local.push(matchRequest.player);

	if (queues.local.length == 2) {
	  const matchPlayers = queues.local.splice(0,2);
	  const match: Match = createMatch(matchPlayers, "local", 0);
	  const res = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match)
	  });
	  console.log("Game engine response:", await res.json());
	  return match;
	}
	return {status: "waiting"};
  })
}


