export interface Player {
	id: string;
}

export interface Match {
	id: string;
	players: Player[];
	mode: "local" | "remote" | "tournament" | "four_players";
	tournament_id: number;
	status: "waiting" | "running" | "finished";
}

export const queues = {
	local: [] as Player[],
	remote: [] as Player[],
	four_players: [] as Player[],
	tournament: [] as Player[] 
}