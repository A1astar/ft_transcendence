import fastify, { FastifyInstance } from "fastify";
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import fastifySession from "@fastify/session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../../../frontend');

function fetchHeaders(reqheaders: Record<string, any>): Record<string, string> {
	return Object.fromEntries(
		Object.entries(reqheaders)
		.filter(([key,value]) => key.toLowerCase() !== 'host' &&
		 key.toLowerCase() !== 'content-length' && 
		 typeof value === 'string')
	);
};

function routeServices(fastify: FastifyInstance, basePath: string, serviceUrl: string) {
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
				reply.code(res.status);
				res.headers.forEach((value, key) => reply.header(key, value));
				return reply.send(data);
			}
			catch (err) {
				console.error(`Error forwarding ${req.url}:`, err);
        		return reply.code(502).send({ error: 'Bad Gateway' });
			}
		}
	});

}

export async function routeRequest(fastify: FastifyInstance) {

	routeServices(fastify, "authentication", "http://localhost:3001");
	routeServices(fastify, "game-orchestration", "http://localhost:3002");
	routeServices(fastify, "game-engine", "http://localhost:3003");


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