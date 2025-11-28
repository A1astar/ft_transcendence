import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyStatic from '@fastify/static';

import '@fastify/static'; //lets Typescript know about the types

import { fileURLToPath } from 'url';
import color from 'chalk';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../../../frontend');

// Get server host from request (since we're connecting to remote servers)
function getServerHostFromRequest(req: any): string {
    return 'localhost';
}

function fetchHeaders(reqheaders: Record<string, any>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(reqheaders)
        .filter(([key,value]) => key.toLowerCase() !== 'host' &&
         key.toLowerCase() !== 'content-length' &&
         typeof value === 'string')
    );
}

function routeServices(fastify: FastifyInstance, basePath: string, serviceName: string, port: number) {
    fastify.route({
        method: ['GET', 'POST', 'PUT', 'DELETE'],
        url: `/${basePath}/*`,
        handler: async (req, reply) => {
            try {
                // In Docker network, we must use service name to reach other containers
                // 'localhost' would refer to the gateway container itself
                const serviceUrl = `http://${serviceName}:${port}`;

                const res = await fetch(`${serviceUrl}${req.url}`, {
                method: req.method,
                headers: fetchHeaders(req.headers),
                body: ['POST','PUT'].includes(req.method) ? JSON.stringify(req.body) : undefined,
                });
                const data = await res.text();
                res.headers.forEach((value, key) => reply.header(key, value));
                // console.log(color.bold.white('Session ID:'));
                // console.log(color.blue(req.session.sessionId));
                // console.log(color.bold.white('Cookie ID:'));
                // console.log(color.blue(req.cookies['id']));
                return reply.code(res.status).send(data);
            }
            catch (err) {
                console.error(`Error forwarding ${req.url}:`, err);
                return reply.code(502).send({ error: 'Bad Gateway' });
            }
        }
    });
}

export async function routeRequest(fastify: FastifyInstance) {

    await fastify.register(fastifyStatic, {
    root: frontendPath,
    prefix: '/',            // optional: default '/'
    index: ['index.html'],  // optional
    wildcard: false,        // avoid catching /api/*
  });

    routeServices(fastify, "api/auth", "authentication", 3001);
    routeServices(fastify, "api/game-orchestration", "game-orchestration", 3002);
    routeServices(fastify, "api/game-engine", "game-engine", 3003);
    routeServices(fastify, "api/user-management", "authentication", 3004);


    // fastify.register(fastifyStatic, {
    //     root: frontendPath,
    //     prefix: '/',
    //     index: ['index.html'],
    //     wildcard: false
    // });

    // fastify.get('/*', async (req, reply) => {
    //     return reply.sendFile('index.html');
    // });

    // SPA fallback
    fastify.get('/*', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.sendFile('index.html');
    });

}
