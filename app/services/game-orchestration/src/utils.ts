import { randomUUID } from "crypto";
import { Player, Match, queues } from "./objects.js";

export function createMatch(
	matchPlayers: Player[],
	matchMode: "local" | "remote2" | "remote4" | "tournament4" | "tournament8",
	tournamentRound: number,
	tournamentId?: string
) {
	const match: Match = {
		id: randomUUID(),
		players: matchPlayers,
		mode: matchMode,
		tournamentRound: tournamentRound,
		tournamentId: tournamentId ? tournamentId : "",
		status: "running"
	};
	return match;
};