import { FastifyInstance } from "fastify";
import { Player, MatchRequest, Match, queues } from "./objects.js";
import { createMatch } from "./utils.js"


export async function remoteMatch2(fastify: FastifyInstance) {
  fastify.post("/api/game-orchestration/remote2", async(request, reply) => {
	const matchRequest = request.body as MatchRequest;
	queues.remote2.push(matchRequest.player);

	if (queues.remote2.length == 2) {
	  const matchPlayers = queues.remote2.splice(0,2);
	  const match: Match = createMatch(matchPlayers, "remote2", 0);
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

export async function remoteMatch4(fastify: FastifyInstance) {
  fastify.post("/api/game-orchestration/remote4", async(request, reply) => {
	const matchRequest = request.body as MatchRequest;
	queues.remote4.push(matchRequest.player);

	if (queues.remote4.length == 4) {
	  const matchPlayers = queues.remote4.splice(0,4);
	  const match: Match = createMatch(matchPlayers, "remote4", 0);
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
