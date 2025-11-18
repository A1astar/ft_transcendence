import { FastifyInstance } from "fastify";
import { Player, MatchRequest, Match, queues, tournamentQueues } from "./objects.js";
import { createMatch } from "./utils.js"
import { randomUUID } from "crypto";

// Store tournament matches that are created but not started
const tournamentMatches = new Map<string, Match[]>();

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
	const currentRound = matchRequest.tournamentRound;
	
	// Calculate required players and matches for this round
	const playersInThisRound = tournamentSize / Math.pow(2, currentRound - 1);
	const matchesInThisRound = playersInThisRound / 2;
	
	console.log(`Tournament ${tournamentId}: Round ${currentRound}, ${queue.length}/${playersInThisRound} players in queue`);
	console.log(`Need to create ${matchesInThisRound} matches for this round`);
	
	// Only proceed when we have all players needed for this round
	if (queue.length >= playersInThisRound) {
		// Create all matches for this round but don't start them yet
		const matches = [];
		
		for (let i = 0; i < matchesInThisRound; i++) {
			const players = queue.splice(0, 2);
			const match = createMatch(players, matchRequest.mode, currentRound, tournamentId);
			match.status = 'waiting'; // All matches start as waiting
			matches.push(match);
		}
		
		// Store/update matches for this tournament
		const existingMatches = tournamentMatches.get(tournamentId) || [];
		tournamentMatches.set(tournamentId, [...existingMatches, ...matches]);
		
		// Start only the first match of this round
		const firstMatch = matches[0];
		if (firstMatch) {
			await startMatch(firstMatch);
			firstMatch.status = 'running';
			
			console.log(`Tournament ${tournamentId}: Round ${currentRound} - Created ${matches.length} matches`);
			console.log(`Started first match with players: ${firstMatch.players.map(p => p.alias).join(', ')}`);
			if (matches.length > 1) {
				console.log(`Waiting matches: ${matches.slice(1).map(m => m.players.map(p => p.alias).join(' vs ')).join(', ')}`);
			}
			
			return {status: "game created", tournamentId: tournamentId, match: firstMatch};
		}
	}
	
	console.log(`Tournament ${tournamentId}: Waiting for more players for round ${currentRound}`);
	return {status: "waiting"};
	});

  // New endpoint to handle match completion and start next match
  fastify.post("/api/game-orchestration/tournament/match-ended", async(request, reply) => {
	const { tournamentId } = request.body as { tournamentId: string };
	
	const matches = tournamentMatches.get(tournamentId);
	if (!matches) {
		return reply.status(404).send({ error: "Tournament not found" });
	}
	
	// Find the next waiting match and start it
	const nextMatch = matches.find(m => m.status === 'waiting');
	if (nextMatch) {
		await startMatch(nextMatch);
		nextMatch.status = 'running';
		
		console.log(`Tournament ${tournamentId}: Started next match with players: ${nextMatch.players.map(p => p.alias).join(', ')}`);
		
		return { status: "next match started", match: nextMatch };
	}
	
	return { status: "no more matches waiting" };
  });
}
