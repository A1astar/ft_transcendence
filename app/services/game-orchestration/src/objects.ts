export interface Player {
	id: string;
	alias: string
}

export interface MatchRequest {
	player: Player;
	mode: "local" | "remote" | "tournament4" | "tournament8" | "four_players";
	tournamentRound: number;
}

export interface Match {
	id: string;
	players: Player[];
	mode: "local" | "remote" | "tournament4" | "tournament8" | "four_players";
	tournamentRound: number;
	status: "waiting" | "running" | "finished";
}

export const queues = {
	local: [] as Player[],
	remote: [] as Player[],
	four_players: [] as Player[],
	tournament: [] as Player[] 
}