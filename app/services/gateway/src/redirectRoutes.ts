import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import '@fastify/static'; //lets Typescript know about the types
import { fileURLToPath } from 'url';
import color from 'chalk';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../../../frontend');

// Determine whether to use local origins (no containers) or Docker service names
const USE_LOCAL = (process.env.LOCAL_DEV === 'true') || (process.env.NODE_ENV === 'development');

function envOriginFor(serviceName: string): string | undefined {
    const key = `SERVICE_${serviceName.replace(/-/g, '_').toUpperCase()}_ORIGIN`;
    return process.env[key];
}

function serviceOrigin(serviceName: string, port: number): string {
    const override = envOriginFor(serviceName);
    if (override) return override.replace(/\/$/, '');
    const host = USE_LOCAL ? 'localhost' : serviceName;
    return `http://${host}:${port}`;
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
        method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        url: `/${basePath}/*`,
        handler: async (req, reply) => {
            try {
                const serviceUrl = serviceOrigin(serviceName, port);

                // Allowlist for public endpoints that don't require authentication (guests)
                const publicPathAllowlist: RegExp[] = [
                    /^\/api\/game-orchestration\/local/,
                    /^\/api\/game-orchestration\/tournament/,
                    /^\/api\/auth\/oauth\//,
                    /^\/public\//,
                    /^\/assets\//
                ];

                const pathOnly = (req.url || '').split('?')[0];
                const isPublicPath = publicPathAllowlist.some(rx => rx.test(pathOnly));

                // Only validate authentication for non-GET requests and non-public paths
                if (serviceName !== 'authentication' && !isPublicPath && req.method !== 'GET') {
                    try {
                        const authUrl = serviceOrigin('authentication', 3001) + `/api/auth/userinfo`;
                        const authRes = await fetch(authUrl, {
                            method: 'GET',
                            headers: fetchHeaders(req.headers),
                        });

                        if (!authRes.ok) {
                            const authBody = await authRes.text().catch(() => 'Unauthorized');
                            return reply.code(authRes.status).send({ error: authBody || 'Unauthorized' });
                        }
                    } catch (e) {
                        console.error('Auth check failed:', e);
                        return reply.code(502).send({ error: 'Authentication service unavailable' });
                    }
                }

                const body = ['POST','PUT','PATCH'].includes(req.method) ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined;

                const res = await fetch(`${serviceUrl}${req.url}`, {
                    method: req.method,
                    headers: fetchHeaders(req.headers),
                    body,
                    redirect: 'manual'
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

export async function routeRequest(fastify: FastifyInstance) {

    routeServices(fastify, "api/auth", "authentication", 3001);
    routeServices(fastify, "api/game-orchestration", "game-orchestration", 3002);
    routeServices(fastify, "api/game-engine", "game-engine", 3003);
    // routeServices(fastify, "api/user-management", "authentication", 3004);

    // SPA fallback
    fastify.get('/*', async (_req: FastifyRequest, reply: FastifyReply) => {
      return reply.sendFile('index.html');
    });
}
