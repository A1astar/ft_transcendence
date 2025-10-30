import Fastify, { FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import path from 'path';
import color from 'chalk';
import { routeRequest } from "./redirectRoutes.js";

async function initAPIGateway(fastify: FastifyInstance) {
    fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
        if (err) {
            fastify.log.error(err)
            throw err
        }
    })

    console.log(color.white.bold("API Gateway state: ") + color.green.bold.italic("running"));
}

// Start server
async function main() {

    const fastify = Fastify({ logger: true });

    fastify.register(fastifyCookie);
    fastify.register(fastifySession, {
        secret: 'a random secret that shoud be longer than length 32',
        cookie: { secure: false, maxAge: 3600 * 1000 },
    });

    routeRequest(fastify);

    try {
        await initAPIGateway(fastify);
    } catch (err) {
        console.log(err);
    }
}

main();