import fastify, { FastifyInstance } from "fastify";
import fastifyStatic from '@fastify/static';

import { fileURLToPath } from 'url';
import color from 'chalk';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../../../frontend');

// Get server host from request (since we're connecting to remote servers)
function getServerHostFromRequest(req: any): string {
    const host = req.headers.host;
    if (host) {
        const hostname = host.split(':')[0];
        return hostname;
    }

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

function routeServices(fastify: FastifyInstance, basePath: string, port: number) {
    fastify.route({
        method: ['GET', 'POST', 'PUT', 'DELETE'],
        url: `/${basePath}/*`,
        handler: async (req, reply) => {
            try {
                const serverHost = getServerHostFromRequest(req);
                const serviceUrl = `http://${serverHost}:${port}`;

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

    routeServices(fastify, "api/auth", 3001);
    routeServices(fastify, "api/game-orchestration", 3002);
    routeServices(fastify, "api/game-engine", 3003);
    routeServices(fastify, "api/user-management", 3004);


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
