export interface Player {
	id?: string;
	alias: string
}

export interface MatchRequest {
	player: Player;
	mode: "local" | "remote2" | "remote4" | "tournament4" | "tournament8";
	tournamentRound: number;
	tournamentId?: string;
}

export interface Match {
	id: string;
	players: Player[];
	mode: "local" | "remote2" | "remote4" | "tournament4" | "tournament8";
	tournamentRound: number;
	tournamentId: string;
	status: "waiting" | "running" | "finished";
	assignments?: Record<string, string>;
}

export const queues = {
	local: [] as Player[],
	remote2: [] as Player[],
	remote4: [] as Player[],
    tournament4: [] as Player[],
    tournament8: []	as Player[]
}

export const tournamentWaitingQueues: Record<string, Player[]> = {
    tournament4: [] as Player[],
    tournament8: []	as Player[]
};

export const tournamentQueues: Map<string, Player[]> = new Map<string, Player[]>();
