import Fastify, { FastifyInstance } from "fastify";
import color from "chalk";

import { routeRequest } from "./redirectRoutes.js";

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

  await routeRequest(fastify);

  try {
    await initGateway(fastify);
  } catch (err) {
    console.log(err);
  }
}

main();
