import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import '@fastify/static';

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
                let serviceUrl: string;
                let userInfoUrl: string;
                if (process.env.LOCAL === 'true') {
                    serviceUrl = `http://localhost:${port}`;
                    userInfoUrl = `http://localhost:3001/api/auth/userinfo`;

                } else {
                    userInfoUrl = `http://authentication:3001/api/auth/userinfo`;
                    serviceUrl = `http://${serviceName}:${port}`;
                }

                // Allowlist for public endpoints that don't require authentication (guests)
                const publicPathAllowlist: RegExp[] = [
                    /^\/api\/game-orchestration\/local/,         // local matches — guest can join local games
                    /^\/api\/game-orchestration\/tournament/,  // tournament
                    /^\/api\/auth\/oauth\//,                     // oauth callbacks should be public
                    /^\/public\//,                               // static public assets
                    /^\/assets\//
                ];

                const pathOnly = (req.url || '').split('?')[0];

                // Only validate authentication for non-GET requests
                // (GETs are treated as public/read-only and allowed for guests)
                // Also allow explicit public paths from `publicPathAllowlist` to skip auth checks
                const isPublicPath = publicPathAllowlist.some(rx => rx.test(pathOnly));
                if (serviceName !== 'authentication' && !isPublicPath && req.method !== 'GET') {
                    try {
                        const authRes = await fetch(userInfoUrl, {
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

                const res = await fetch(`${serviceUrl}${req.url}`, {
                    method: req.method,
                    headers: fetchHeaders(req.headers),
                    body: ['POST','PUT'].includes(req.method) ? JSON.stringify(req.body) : undefined,
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

    // fastify.get('/*', async (_req: FastifyRequest, reply: FastifyReply) => {
    //     return reply.sendFile('index.html');
    // });

}
