import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

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

fastify.listen({ port: 8080 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
