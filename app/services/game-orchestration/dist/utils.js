import { randomUUID } from "crypto";
export function createMatch(matchPlayers, matchMode, tournamentId) {
    const match = {
        id: randomUUID(),
        players: matchPlayers,
        mode: matchMode,
        tournament_id: tournamentId,
        status: "running"
    };
    return match;
}
;
