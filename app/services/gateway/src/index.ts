import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import color from 'chalk';
import path from 'path';

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

// Start server
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