import Fastify, { FastifyInstance } from 'fastify'
import chalk from 'chalk'

async function routeRequest(fastify: FastifyInstance) {
    fastify.all('*', async(request, reply) => {
        const path = request.raw.url;

        switch (path) {
            case "/":
                console.log(chalk.red.bold("/"));
                break;
            case "/auth":
                console.log(chalk.blue.bold("/authentication"));
                break;
            case "/game-orchestration":
                console.log(chalk.yellow.bold("/game-orchestration"));
                break;
            case "/game-engine":
                console.log(chalk.green.bold("/game-engine"));
                break;
        }
    });
}

async function initServer(fastify: FastifyInstance) {
    fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        throw err
    }
    })
}

async function main() {
    const fastify = Fastify({
        logger: true
    })

    try {
        initServer(fastify);
        routeRequest(fastify);

    } catch (err) {
        console.log(err);
    }
}

main();