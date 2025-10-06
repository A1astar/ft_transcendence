import { queues } from "./objects.js";
import { createMatch } from "./utils.js";
export default async function localMatch(fastify) {
    fastify.post("/game-orchestration/local", async (request, reply) => {
        const player = request.body;
        queues.local.push(player);
        if (queues.local.length == 2) {
            const matchPlayers = queues.local.splice(0, 2);
            const match = createMatch(matchPlayers, "local", 0);
            const res = await fetch("http://localhost:3002/game-engine/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(match)
            });
            console.log("Game engine response:", await res.json());
            return match;
        }
        return { status: "waiting" };
    });
}
