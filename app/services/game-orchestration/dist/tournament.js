import { queues } from "./objects.js";
import { createMatch } from "./utils.js";
export default async function tournamentMatch(fastify) {
    fastify.post("/game-orchestration/tournament", async (request, reply) => {
        const player = request.body;
        queues.tournament.push(player);
        if (queues.tournament.length == 2) {
            const matchPlayers = queues.tournament.splice(0, 2);
            const match = createMatch(matchPlayers, "tournament", 0);
            const res = fetch("http://localhost:3002/game-engine/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(match)
            });
            return match;
        }
        return { status: "waiting" };
    });
}
