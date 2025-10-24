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

<<<<<<< HEAD
	if (matchRequest.tournamentRound == 1)
		return(fourPlayerTournament());
	else if (matchRequest.tournamentRound == 2)
		return(fourPlayerTourRematch1(tournamentId));
  })
}

export async function tournamentMatch8(fastify: FastifyInstance) {
  fastify.post("/api/game-orchestration/tournament8", async(request, reply) => {
	const matchRequest = request.body as MatchRequest;
	const tournamentId = matchRequest.tournamentId;
	tournament8Queue.push(matchRequest.player)

	if (matchRequest.tournamentRound == 1)
		return(eightPlayerTournament());
	else if (matchRequest.tournamentRound == 2)
		return(eightPlayerTourRematch1(tournamentId));
	else if (matchRequest.tournamentRound == 3)
		return(eightPlayerTourRematch2(tournamentId));
  })
}

async function fourPlayerTournament() {
	if (tournament4Queue.length == 4) {
		let tournamentId:string = randomUUID();
		if (!tournamentQueues.get(tournamentId))
		{
			tournamentQueues.set(tournamentId, tournament4Queue);
		}
	  	const matchPlayers1 = tournament4Queue.splice(0,2);
	  	const match1: Match = createMatch(matchPlayers1, "tournament4", 1, tournamentId);
	 	const res1 = await fetch("http://localhost:3003/game-engine/start", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(match1)
		});
		console.log("Game engine response:", await res1.json());

		const matchPlayers2 = tournament4Queue.splice(0,2);
		const match2: Match = createMatch(matchPlayers2, "tournament4", 1, tournamentId);
		const res2 = await fetch("http://localhost:3003/game-engine/start", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(match2)
	  	});
	  	console.log("Game engine response:", await res2.json());
	  	return {status: "game created", tournamentId: tournamentId};
	}
	return {status: "waiting"};
}

async function eightPlayerTournament() {
	if (tournament8Queue.length == 8) {
		let tournamentId:string = randomUUID();
		if (!tournamentQueues.get(tournamentId))
		{
			tournamentQueues.set(tournamentId, tournament8Queue);
		}
		const matchPlayers1 = tournament8Queue.splice(0,2);
		const match1: Match = createMatch(matchPlayers1, "tournament8", 1, tournamentId);
		const res1 = await fetch("http://localhost:3003/game-engine/start", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(match1)
		});
		console.log("Game engine response:", await res1.json());
		const matchPlayers2 = tournament8Queue.splice(0,2);
		const match2: Match = createMatch(matchPlayers2, "tournament8", 1, tournamentId);
		const res2 = await fetch("http://localhost:3003/game-engine/start", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(match2)
		});
		console.log("Game engine response:", await res2.json());
		const matchPlayers3 = tournament8Queue.splice(0,2);
		const match3: Match = createMatch(matchPlayers3, "tournament8", 1, tournamentId);
		const res3 = await fetch("http://localhost:3003/game-engine/start", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(match3)
		});
		console.log("Game engine response:", await res3.json());
		const matchPlayers4 = tournament8Queue.splice(0,2);
		const match4: Match = createMatch(matchPlayers4, "tournament8", 1, tournamentId);
		const res4 = await fetch("http://localhost:3003/game-engine/start", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(match4)
		});
		console.log("Game engine response:", await res4.json());
		return {status: "game created", tournamentId: tournamentId};
	}
	return {status: "waiting"};
}

async function fourPlayerTourRematch1(tournamentId: string) {
	if (!tournamentQueues.get(tournamentId))
		return {status: "error"};
	else {
		const queue = tournamentQueues.get(tournamentId);
		if (queue && queue.length == 2) {
			const matchPlayers1 = queue.splice(0,2);
			const match1: Match = createMatch(matchPlayers1, "tournament4", 2, tournamentId);
			const res1 = await fetch("http://localhost:3003/game-engine/start", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(match1)
			});
			console.log("Game engine response:", await res1.json());
			return {status: "game created", tournamentId: tournamentId};
		}
		else {
			return {status: "waiting"}
		}
	}
}

async function eightPlayerTourRematch1(tournamentId: string) {
	if (!tournamentQueues.get(tournamentId))
		return {status: "error"};
	else {
		const queue = tournamentQueues.get(tournamentId);
		if (queue && queue.length == 4) {
		const matchPlayers1 = queue.splice(0,2);
		const match1: Match = createMatch(matchPlayers1, "tournament8", 2, tournamentId);
		const res1 = await fetch("http://localhost:3003/game-engine/start", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(match1)
		});
		console.log("Game engine response:", await res1.json());
		const matchPlayers2 = queue.splice(0,2);
		const match2: Match = createMatch(matchPlayers2, "tournament8", 2, tournamentId);
		const res2 = await fetch("http://localhost:3003/game-engine/start", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(match2)
		});
		console.log("Game engine response:", await res2.json());
		return {status: "game created", tournamentId: tournamentId};
=======
	if (!tournamentId || !tournamentQueues.has(tournamentId)) {
		queues[mode].push(matchRequest.player);
		if (queues[mode].length >= tournamentSize) {
			tournamentId = randomUUID();
			tournamentQueues.set(tournamentId, [...queues[mode]]);
			queues[mode] = [];
>>>>>>> origin/feature/remote-player
		}
		else {
			return {status: "waiting"};
		}
	}
	else {
<<<<<<< HEAD
		const queue = tournamentQueues.get(tournamentId);
		if (queue && queue.length == 2) {
			const matchPlayers1 = queue.splice(0,2);
			const match1: Match = createMatch(matchPlayers1, "tournament8", 3, tournamentId);
			const res1 = await fetch("http://localhost:3003/game-engine/start", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(match1)
			});
			console.log("Game engine response:", await res1.json());
			return {status: "game created", tournamentId: tournamentId};
		}
		else {
			return {status: "waiting"}
		}
=======
		tournamentQueues.get(tournamentId)!.push(matchRequest.player);
>>>>>>> origin/feature/remote-player
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
