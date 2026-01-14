import { remoteMatch2, remoteMatch4 } from "./remote.js";
import { tournamentMatch } from "./tournament.js";
import { localMatch } from "./local.js";
import client from "prom-client";
import cors from "@fastify/cors";
import Fastify from "fastify";
import chalk from "chalk";

async function start() {
  const fastify = Fastify({ logger: false });

  // Enable CORS (allow connections from frontend or other services)
  fastify.register(cors, { origin: "*" });

  // Prometheus metrics setup
  const registry = new client.Registry();
  client.collectDefaultMetrics({ register: registry });

  fastify.get("/metrics", async (_req, reply) => {
    reply.header("Content-Type", registry.contentType);
    return registry.metrics();
  });


  localMatch(fastify);
  remoteMatch2(fastify);
  remoteMatch4(fastify);
  tournamentMatch(fastify);

  try {
    await fastify.listen({ port: 3002, host: "0.0.0.0" });
    console.log(
      chalk.green.bold("Game Orchestration Service running on port 3002")
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
