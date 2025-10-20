import { FastifyInstance } from "fastify";
import { Player, MatchRequest, Match, queues, tournamentQueues } from "./objects.js";
import { createMatch } from "./utils.js"
import { randomUUID } from "crypto";

async function startMatch(match: Match) {
  const res = await fetch("http://localhost:3003/game-engine/start", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(match),
  });
  return res.json();
}

export async function tournamentMatch(fastify: FastifyInstance) {
  fastify.post("/api/game-orchestration/tournament", async(request, reply) => {
	const matchRequest = request.body as MatchRequest;
	const mode = matchRequest.mode;
	if (!queues[mode])
			queues[mode] = [];
	const tournamentSize = mode === "tournament4" ? 4 : 8;
	let tournamentId = matchRequest.tournamentId;

	if (!tournamentId || !tournamentQueues.has(tournamentId)) {
		queues[mode].push(matchRequest.player);
		if (queues[mode].length >= tournamentSize) {
			tournamentId = randomUUID();
			tournamentQueues.set(tournamentId, [...queues[mode]]);
			queues[mode] = [];
		}
		else {
			return {status: "waiting"};
		}
	}
	else {
		tournamentQueues.get(tournamentId)!.push(matchRequest.player);
	}
	const queue = tournamentQueues.get(tournamentId)!;
	const requiredPlayer = tournamentSize / Math.pow(2, matchRequest.tournamentRound - 1);
	const matchCount = requiredPlayer / 2;

	console.log(queue.length, requiredPlayer, tournamentId);
	if (queue.length >= requiredPlayer) {
		for (let i = 0; i < matchCount; ++i) {
			const players = queue.splice(0, 2);
			const match = createMatch(players, matchRequest.mode, matchRequest.tournamentRound, tournamentId);
			await startMatch(match);
		}
		return {status: "game created", tournamentId: tournamentId};
	}
	console.log(queue);
	return {status: "waiting"};
	})
}
