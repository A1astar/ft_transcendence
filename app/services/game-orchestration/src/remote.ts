import Fastify, { FastifyInstance } from "fastify";
import { Player, Match, queues } from "./objects.js";
import { createMatch } from "./utils.js"


export default async function remoteMatch(fastify: FastifyInstance) {
  fastify.post("/game-orchestration/remote", async(request, reply) => {
	const player = request.body as Player;
	queues.remote.push(player);

	if (queues.remote.length == 2) {
	  const matchPlayers = queues.remote.splice(0,2);
	  const match: Match = createMatch(matchPlayers, "remote", 0);
	  const res = await fetch("http://localhost:3002/game-engine/start", {
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
