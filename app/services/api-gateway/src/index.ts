import Fastify, { FastifyInstance } from 'fastify'

async function routeRequest(fastify: FastifyInstance) {
    fastify.get('/', function (request, reply) {
        reply
        .type('text/html')
        .send(`
            <!DOCTYPE html>
            <html>
            <head><title>Fastify Page</title></head>
            <body>
                <h1 align="center"><bold>TRANSCENDENCE</bold></h1>
            </body>
            </html>
        `);
    })
}

async function initServer(fastify: FastifyInstance) {
    fastify.listen({ port: 3001, host: "0.0.0.0" }, function (err, address) {
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