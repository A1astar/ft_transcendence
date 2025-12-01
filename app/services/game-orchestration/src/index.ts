import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
// import { randomUUID } from "crypto";
// import { Player, Match, queues } from "./objects.js";
import { localMatch } from "./local.js";
import { remoteMatch2, remoteMatch4 } from "./remote.js";
import { tournamentMatch } from "./tournament.js";
import chalk from 'chalk';


// Start server
async function start() {

  const fastify = Fastify({ logger: false });

  // Enable CORS (allow connections from frontend or other services)
  fastify.register(cors, {origin: "*"});

  localMatch(fastify);
  remoteMatch2(fastify);
  remoteMatch4(fastify);
  tournamentMatch(fastify);

  try {
    await fastify.listen({ port: 3002, host: "0.0.0.0" });
    console.log(chalk.green.bold("Game Orchestration Service running on port 3002"));
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
