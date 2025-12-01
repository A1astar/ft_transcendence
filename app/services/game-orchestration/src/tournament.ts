import { FastifyInstance } from "fastify";
import { Player, MatchRequest, Match, queues, tournamentQueues } from "./objects.js";
import { createMatch } from "./utils.js";
import { GAME_ENGINE_START_ENDPOINT } from "./config.js";
import { randomUUID } from "crypto";

// Store tournament matches that are created but not started
const tournamentMatches = new Map<string, Match[]>();

async function startMatch(match: Match) {
  const res = await fetch(GAME_ENGINE_START_ENDPOINT, {
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
	const tournamentSize = mode === "tournament4" ? 4 : 8;
	let tournamentId = matchRequest.tournamentId;

	// Initialize tournament queue if needed
	if (!tournamentId || !tournamentQueues.has(tournamentId)) {
		if (!queues[mode]) queues[mode] = [];
		queues[mode].push(matchRequest.player);

		if (queues[mode].length >= tournamentSize) {
			tournamentId = randomUUID();
			tournamentQueues.set(tournamentId, [...queues[mode]]);
			queues[mode] = [];
		} else {
			return {status: "waiting"};
		}
	} else {
		tournamentQueues.get(tournamentId)!.push(matchRequest.player);
	}

	const queue = tournamentQueues.get(tournamentId)!;
	const currentRound = matchRequest.tournamentRound;
	const playersInThisRound = tournamentSize / Math.pow(2, currentRound - 1);
	const matchesInThisRound = playersInThisRound / 2;

	// Create matches when we have enough players for this round
	if (queue.length >= playersInThisRound) {
		const matches = [];
		for (let i = 0; i < matchesInThisRound; i++) {
			const players = queue.splice(0, 2);
			const match = createMatch(players, matchRequest.mode, currentRound, tournamentId);
			match.status = 'waiting';
			matches.push(match);
		}

		const existingMatches = tournamentMatches.get(tournamentId) || [];
		tournamentMatches.set(tournamentId, [...existingMatches, ...matches]);

		console.log("matches[0]:")
		console.log(matches[0]);
		return {status: "game created", tournamentId: tournamentId, match: matches[0]};

	}

	return {status: "waiting"};
	});

  // Handle match completion and find next match
  fastify.post("/api/game-orchestration/tournament/match-ended", async(request, reply) => {
	const { tournamentId, matchId } = request.body as { tournamentId: string; matchId: string };

	const matches = tournamentMatches.get(tournamentId);
	if (!matches) {
		return reply.status(404).send({ error: "Tournament not found" });
	}

	// Mark current match as finished
	const currentMatch = matches.find(m => m.id === matchId);
	if (currentMatch) {
		currentMatch.status = 'finished';
	}

	// Find next waiting match (current round first, then next round)
	const nextMatch = matches.find(m => m.status === 'waiting');
	if (nextMatch) {
		return { status: "next match available", match: nextMatch };
	}

	// Check if tournament is complete
	const currentRound = currentMatch?.tournamentRound || 1;
	const totalSize = matches[0]?.mode === "tournament4" ? 4 : 8;
	const maxRounds = totalSize === 4 ? 2 : 3;

	if (currentRound >= maxRounds) {
		return { status: "tournament complete" };
	}

	return { status: "no more matches waiting" };
  });

  // Start a specific match
  fastify.post("/api/game-orchestration/tournament/start-match", async(request, reply) => {
	const { matchId } = request.body as { matchId: string };

	// Find the match across all tournaments
	let targetMatch: Match | undefined;
	for (const matches of tournamentMatches.values()) {
		targetMatch = matches.find(m => m.id === matchId);
		if (targetMatch) break;
	}

	if (!targetMatch) {
		return reply.status(404).send({ error: "Match not found" });
	}

	if (targetMatch.status !== 'waiting') {
		return reply.status(400).send({ error: `Match is not in waiting status. Current status: ${targetMatch.status}` });
	}

	await startMatch(targetMatch);
	targetMatch.status = 'running';

	return { status: "match started", match: targetMatch };
  });
}
