import Fastify, { FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import path from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../../../frontend');
console.log(frontendPath);

function manageAuthentication() {
    console.log(chalk.blue.bold("/authentication"));
}

function manageGameOrchestration() {
    console.log(chalk.yellow.bold("/game-orchestration"));
}

function manageGameEngine() {
    console.log(chalk.green.bold("/game-bravo engine"));
}

async function routeRequest(fastify: FastifyInstance) {
    // fastify.all('*', async(request, reply) => {
    //     const path = request.raw.url;

    //     switch (path) {
    //         case "/":
    //             console.log(chalk.red.bold("/"));
    //             break;
    //         case "/authentication":
    //             manageAuthentication();
    //             break;
    //         case "/game-orchestration":
    //             manageGameOrchestration();
    //             break;
    //         case "/game-engine":
    //             manageGameEngine();
    //             break;
    //     }
    // });

    fastify.register(fastifyStatic, {
        root: frontendPath,
        prefix: '/',
        index: ['index.html'],
        wildcard: false
    });

    fastify.get('/*', async (req, reply) => {
        return reply.sendFile('index.html');
    });

}

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

    try {
        await routeRequest(fastify);
        await initAPIGateway(fastify);
    } catch (err) {
        console.log(err);
    }
}

main();
