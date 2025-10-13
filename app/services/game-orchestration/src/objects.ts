export interface Player {
	id: string;
	alias: string
}

export interface MatchRequest {
	player: Player;
	mode: "local" | "remote2" | "remote4" | "tournament4" | "tournament8";
	tournamentRound: number;
}

export interface Match {
	id: string;
	players: Player[];
	mode: "local" | "remote2" | "remote4" | "tournament4" | "tournament8";
	tournamentRound: number;
	status: "waiting" | "running" | "finished";
}

export const queues = {
	local: [] as Player[],
	remote2: [] as Player[],
	remote4: [] as Player[],
	tournament: [] as Player[],
}