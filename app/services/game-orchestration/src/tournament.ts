import { FastifyInstance } from "fastify";
import { Player, MatchRequest, Match, queues } from "./objects.js";
import { createMatch } from "./utils.js"


export async function tournamentMatch(fastify: FastifyInstance) {
  fastify.post("/game-orchestration/tournament", async(request, reply) => {
	const matchRequest = request.body as MatchRequest;
	queues.tournament.push(matchRequest.player);

	if (matchRequest.mode == "tournament4") {
		if (matchRequest.tournamentRound == 1)
			return(fourPlayerTournament());
		else if (matchRequest.tournamentRound == 2)
			return(fourPlayerTourRematch1());
	}
	else if (matchRequest.mode == "tournament8") {
		if (matchRequest.tournamentRound == 1)
			return(eightPlayerTournament());
		else if (matchRequest.tournamentRound == 2)
			return(eightPlayerTourRematch1());
		else if (matchRequest.tournamentRound == 3)
			return(eightPlayerTourRematch2());
	}
  })
}

async function fourPlayerTournament() {
	if (queues.tournament.length == 4) {
	  const matchPlayers1 = queues.tournament.splice(0,2);
	  const match1: Match = createMatch(matchPlayers1, "tournament4", 1);
	  const res1 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match1)
	  });
	  console.log("Game engine response:", await res1.json());

	  const matchPlayers2 = queues.tournament.splice(0,2);
	  const match2: Match = createMatch(matchPlayers2, "tournament4", 1);
	  const res2 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match2)
	  });
	  console.log("Game engine response:", await res2.json());
	  return {status: "game created"};
	}
	return {status: "waiting"};
}

async function eightPlayerTournament() {
	if (queues.tournament.length == 8) {
	  const matchPlayers1 = queues.tournament.splice(0,2);
	  const match1: Match = createMatch(matchPlayers1, "tournament8", 1);
	  const res1 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match1)
	  });
	  console.log("Game engine response:", await res1.json());
	  const matchPlayers2 = queues.tournament.splice(0,2);
	  const match2: Match = createMatch(matchPlayers2, "tournament8", 1);
	  const res2 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match2)
	  });
	  console.log("Game engine response:", await res2.json());
	  const matchPlayers3 = queues.tournament.splice(0,2);
	  const match3: Match = createMatch(matchPlayers3, "tournament8", 1);
	  const res3 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match3)
	  });
	  console.log("Game engine response:", await res3.json());
	  const matchPlayers4 = queues.tournament.splice(0,2);
	  const match4: Match = createMatch(matchPlayers4, "tournament8", 1);
	  const res4 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match3)
	  });
	  console.log("Game engine response:", await res4.json());
	  return {status: "game created"};
	}
	return {status: "waiting"};
}

async function fourPlayerTourRematch1() {
	if (queues.tournament.length == 2) {
	  const matchPlayers1 = queues.tournament.splice(0,2);
	  const match1: Match = createMatch(matchPlayers1, "tournament4", 2);
	  const res1 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match1)
	  });
	  console.log("Game engine response:", await res1.json());
	  return {status: "game created"};
	}
	return {status: "waiting"};
}

async function eightPlayerTourRematch1() {
	if (queues.tournament.length == 4) {
	  const matchPlayers1 = queues.tournament.splice(0,2);
	  const match1: Match = createMatch(matchPlayers1, "tournament8", 2);
	  const res1 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match1)
	  });
	  console.log("Game engine response:", await res1.json());
	  const matchPlayers2 = queues.tournament.splice(0,2);
	  const match2: Match = createMatch(matchPlayers2, "tournament8", 2);
	  const res2 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match2)
	  });
	  console.log("Game engine response:", await res2.json());
	  return {status: "game created"};
	}
	return {status: "waiting"};
}

async function eightPlayerTourRematch2() {
	if (queues.tournament.length == 2) {
	  const matchPlayers1 = queues.tournament.splice(0,2);
	  const match1: Match = createMatch(matchPlayers1, "tournament8", 3);
	  const res1 = await fetch("http://localhost:3003/game-engine/start", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(match1)
	  });
	  console.log("Game engine response:", await res1.json());
	  return {status: "game created"};
	}
	return {status: "waiting"};
}
