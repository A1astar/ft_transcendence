import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import color from 'chalk';
import path from 'path';

import { routeRequest } from "./redirectRoutes.js";

async function initGateway(fastify: FastifyInstance) {
    fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
        if (err) {
            fastify.log.error(err)
            throw err
        }
    })

    console.log(color.green.bold("API Gateway Service running on port 3000"));
}

// Start server
async function main() {

    const fastify = Fastify({ logger: false });

    routeRequest(fastify);

    try {
        await initGateway(fastify);
    } catch (err) {
        console.log(err);
    }
}

main();