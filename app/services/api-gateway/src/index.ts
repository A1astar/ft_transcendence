import Fastify, { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import chalk from 'chalk';

let page = `
<!DOCTYPE html>
<html>
    <head>
        <title>Transcendence</title>
    </head>

    <body>
        <h1 align="center">Transcendence</h1>
        <script>

        </script>
    </body>
</html>
`;

function manageAuthentication() {
    console.log(chalk.blue.bold("/authentication"));
}

function manageGameOrchestration() {
    console.log(chalk.yellow.bold("/game-orchestration"));
}

function manageGameEngine() {
    console.log(chalk.green.bold("/game-engine"));
}

async function routeRequest(fastify: FastifyInstance) {
    fastify.all('*', async(request, reply) => {
        const path = request.raw.url;

        switch (path) {
            case "/":
                console.log(chalk.red.bold("/"));
                break;
            case "/authentication":
                manageAuthentication();
                break;
            case "/game-orchestration":
                manageGameOrchestration();
                break;
            case "/game-engine":
                manageGameEngine();
                break;
        }
    });


    fastify.get('/', async (request, reply) => {
        console.log(chalk.magenta.bold("request: ") + chalk.blue.bold(request.url));
        reply
        .code(200)
        .type('text/html')
        .send(page);
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

async function main() {
    // const fastify = Fastify({ logger: true });
    const fastify = Fastify();

    try {
        initAPIGateway(fastify);
        await routeRequest(fastify);

    } catch (err) {
        console.log(err);
    }
}

main();