import Fastify, { FastifyInstance } from "fastify";
import { routeRequest } from "./redirectRoutes.js";
import client from "prom-client";
import color from "chalk";

async function initGateway(fastify: FastifyInstance) {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log(color.green.bold("API Gateway Service running on port 3000"));
  } catch (err) {
    fastify.log.error(err);
    throw err;
  }
}

async function main() {
  const fastify = Fastify({ logger: false });

  // Prometheus metrics setup
  const registry = new client.Registry();
  client.collectDefaultMetrics({ register: registry });

  fastify.get("/metrics", async (_req, reply) => {
    reply.header("Content-Type", registry.contentType);
    return registry.metrics();
  });

  await routeRequest(fastify);

  try {
    await initGateway(fastify);
  } catch (err) {
    console.log(err);
  }
}

main();
