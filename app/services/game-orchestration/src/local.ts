import { MatchRequest, Match, queues } from "./objects.js";
import { GAME_ENGINE_START_ENDPOINT } from "./config.js";
import { FastifyInstance } from "fastify";
import { createMatch } from "./utils.js";

export async function localMatch(fastify: FastifyInstance) {
  fastify.post("/api/game-orchestration/local", async (request, reply) => {
    const matchRequest = request.body as MatchRequest;
    queues.local.push(matchRequest.player);

    if (queues.local.length == 2) {
      const matchPlayers = queues.local.splice(0, 2);
      const match: Match = createMatch(matchPlayers, "local", 0);
      const res = await fetch(GAME_ENGINE_START_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(match),
      });
      console.log("Game engine response:", await res.json());
      return match;
    }
    return { status: "waiting" };
  });
}
