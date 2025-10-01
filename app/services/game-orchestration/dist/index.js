import Fastify from "fastify";
import cors from "@fastify/cors";
import localMatch from "./local.js";
import remoteMatch from "./remote.js";
// todo
// fastify.post("/matchmaking/tournament", async(request, reply) => {
//   const player = request.body as Player;
//   queues.tournament.push(player);
//   if (queues.tournament.length == 4) {
//     const matchPlayers1 = queues.tournament.splice(0,2);
//     const match1: Match = {
//       id: randomUUID(),
//       players: matchPlayers1,
//       mode: "tournament",
//       tournament_id: 1,
//       status: "running"
//     };
//     const matchPlayers2 = queues.tournament.splice(0,2);
//     const match2: Match = {
//       id: randomUUID(),
//       players: matchPlayers2,
//       mode: "tournament",
//       tournament_id: 2,
//       status: "running"
//     };
//     return match1;
//   }
//   return {status: "waiting"};
// })
// Start server
async function start() {
    const fastify = Fastify({ logger: true });
    // Enable CORS (allow connections from frontend or other services)
    fastify.register(cors, {
        origin: "*"
    });
    localMatch(fastify);
    remoteMatch(fastify);
    try {
        await fastify.listen({ port: 3001, host: "0.0.0.0" });
        console.log("Game Orchestration Service running on port 3001");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
;
start();
