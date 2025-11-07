import { FastifyInstance } from "fastify";
import { Player, MatchRequest, Match, queues } from "./objects.js";
import { createMatch } from "./utils.js"


// Keep track of active matches to prevent double-creation
let activeMatches = new Map<string, Match>();

async function createAndStartMatch(players: Player[]): Promise<Match> {
  const playerKey = players.map(p => p.alias).sort().join('-');
  if (activeMatches.has(playerKey)) {
    return activeMatches.get(playerKey)!;
  }
  const match: Match = createMatch(players, "remote2", 0);
  try {
    const res = await fetch("http://localhost:3003/game-engine/start", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(match)
    });
    console.log("Game engine response:", await res.json());
    
    activeMatches.set(playerKey, match);
    setTimeout(() => activeMatches.delete(playerKey), 5000);
    return match;
  } catch (error) {
    console.error("Failed to start game:", error);
    throw error;
  }
}

export async function remoteMatch2(fastify: FastifyInstance) {
  fastify.post("/api/game-orchestration/remote2", async(request, reply) => {
    const matchRequest = request.body as MatchRequest;
    if (queues.remote2.some(p => p.alias === matchRequest.player.alias)) {
      reply.code(400);
      return { error: "Player already in queue" };
    }
    queues.remote2.push(matchRequest.player);
    console.log(`Player ${matchRequest.player.alias} joined queue. Queue size: ${queues.remote2.length}`);

    if (queues.remote2.length >= 2) {
      const matchPlayers = queues.remote2.splice(0, 2);
      return await createAndStartMatch(matchPlayers);
    }
    return {status: "waiting"};
  });

  // Check queue status endpoint
  fastify.get("/api/game-orchestration/remote2/status", async(request, reply) => {
    const playerAlias = request.query as { alias: string };
    if (!playerAlias.alias) {
      reply.code(400);
      return { error: "Player alias is required" };
    }

    // Check if this player is in any active match
    for (const [key, match] of activeMatches.entries()) {
      const matchPlayers = key.split('-');
      if (matchPlayers.includes(playerAlias.alias)) {
        return match;
      }
    }

    console.log(`Status check for ${playerAlias.alias} - no match found yet`);
    return {status: "waiting"};
  });

  // Leave queue endpoint
  fastify.post("/api/game-orchestration/remote2/leave", async(request, reply) => {
    const matchRequest = request.body as MatchRequest;
    const index = queues.remote2.findIndex(p => p.alias === matchRequest.player.alias);
    if (index !== -1) {
      queues.remote2.splice(index, 1);
      console.log(`Player ${matchRequest.player.alias} left queue. Queue size: ${queues.remote2.length}`);
    }
    return { status: "success" };
  });
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
