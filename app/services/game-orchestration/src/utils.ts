import { randomUUID } from "crypto";
import { Player, Match, queues } from "./objects.js";

export function createMatch(matchPlayers:Player[], matchMode: "local" | "remote" | "tournament4" | "tournament8" | "four_players", tournamentRound:number) {
  const match: Match = {
	id: randomUUID(),
	players: matchPlayers,
	mode: matchMode,
	tournamentRound: tournamentRound,
	status: "running"
  };
  return match;
};