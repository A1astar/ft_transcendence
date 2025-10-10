import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
// import { randomUUID } from "crypto";
// import { Player, Match, queues } from "./objects.js";
import { localMatch } from "./local.js";
import { remoteMatch } from "./remote.js";
import { tournamentMatch } from "./tournament.js";


// Start server
async function start() {

  const fastify = Fastify({ logger: true });

  // Enable CORS (allow connections from frontend or other services)
  fastify.register(cors, {origin: "*"});

  localMatch(fastify);
  remoteMatch(fastify);
  tournamentMatch(fastify);

  try {
    await fastify.listen({ port: 3002, host: "0.0.0.0" });
    console.log("Game Orchestration Service running on port 3002");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
