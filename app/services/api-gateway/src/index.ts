import Fastify, { FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { routeRequest } from "./redirectRoutes.js";
import chalk from 'chalk';

async function initAPIGateway(fastify: FastifyInstance) {
    fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
    console.log(chalk.white.bold("API Gateway state: ") + chalk.green.bold.italic("running"));
    if (err) {
        fastify.log.error(err)
        throw err
    }
    })
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