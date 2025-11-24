import fastify, { FastifyInstance } from "fastify";
// import fastifySession from "@fastify/session";
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import color from 'chalk';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Frontend path: in Docker, it's copied to /app/frontend
const frontendPath = path.join(__dirname, '../frontend');

function fetchHeaders(reqheaders: Record<string, any>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(reqheaders)
        .filter(([key,value]) => key.toLowerCase() !== 'host' &&
         key.toLowerCase() !== 'content-length' &&
         typeof value === 'string')
    );
};

function setupServiceRoutes(fastify: FastifyInstance, basePath: string, serviceUrl: string) {
    fastify.route({
        method: ['GET', 'POST', 'PUT', 'DELETE'],
        url: `/${basePath}/*`,
        handler: async (req, reply) => {
            try {
                const res = await fetch(`${serviceUrl}${req.url}`, {
                method: req.method,
                headers: fetchHeaders(req.headers),
                body: ['POST','PUT'].includes(req.method) ? JSON.stringify(req.body) : undefined,
                });
                const data = await res.text();
                res.headers.forEach((value, key) => reply.header(key, value));
                return reply.code(res.status).send(data);
            }
            catch (err) {
                console.error(`Error forwarding ${req.url}:`, err);
                return reply.code(502).send({ error: 'Bad Gateway' });
            }
        }
    });
}

function initFastifyStatic(fastify: FastifyInstance) {
    fastify.register(fastifyStatic, {
        root: frontendPath,
        prefix: '/',
        index: ['index.html'],
        wildcard: false
    });
}

export async function routeRequest(fastify: FastifyInstance) {

    setupServiceRoutes(fastify, "api/auth", "http://authentication:3001");
    setupServiceRoutes(fastify, "api/game-orchestration", "http://game-orchestration:3002");
    setupServiceRoutes(fastify, "api/game-engine", "http://game-engine:3003");

    initFastifyStatic(fastify);
    fastify.get('/*', async (req, reply) => {
        return reply.sendFile('index.html');
    });
}
