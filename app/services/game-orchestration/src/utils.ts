import { randomUUID } from "crypto";
import { Player, Match, queues } from "./objects.js";

export function createMatch(matchPlayers:Player[], matchMode: "local" | "remote" | "tournament" | "four_players", tournamentId:number) {
  const match: Match = {
	id: randomUUID(),
	players: matchPlayers,
	mode: matchMode,
	tournament_id: tournamentId,
	status: "running"
  };
  return match;
};