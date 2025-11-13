import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3"
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
// import HashiCorpVault from 'node-vault';
import crypto from 'crypto';
import color from 'chalk';

import { userFormatCorrect, RegisterFormat, UserFormat } from './format.js';
import { initFastifyInstance } from './init.js';
import { printRequest } from './print.js';
import Database from "./database.js";
import { User } from "./user.js";

function getRequestHeaders(request: FastifyRequest) : object {
    if (!request.headers)
        return {};
    return Object.entries(request.headers);
}

function getRequestBody(request: FastifyRequest) : object {
    if (!request.body || typeof request.body !== 'object')
        return {};
    return Object.entries(request.body);
}

function printSession(request: FastifyRequest) {
    console.log(color.bold.white('Session ID:'));
    console.log(color.blue(request.session.sessionId));
    console.log(color.bold.white('Cookie ID:'));
    console.log(color.blue(request.cookies['id']));
}

function logAccount(request: FastifyRequest, reply: FastifyReply, database: Database) {
    console.log(color.bold.italic.yellow("----- LOGIN -----"));
    console.log(color.red('Raw body:'), JSON.stringify(request.body, null, 2));
    const user = request.body as UserFormat;

    console.log(color.bold.blue('username: ') + user.name);
    console.log(color.bold.blue('password: ') + user.password);
}

function registerAccount(request: FastifyRequest, reply: FastifyReply, database: Database) {

    console.log(color.bold.italic.yellow("\n----- REGISTER -----"));

    const headers = getRequestHeaders(request);
    const userInfo = getRequestBody(request) as RegisterFormat;

    if (userFormatCorrect(userInfo))
        database.addUser(userInfo);
}

function registerOAuth(path: string, request: FastifyRequest, reply: FastifyReply, database: Database) {
    let provider;
    const oauthMatch = path?.match(/^\/api\/auth\/oauth\/(\w+)/);

    if (oauthMatch) {
        provider = oauthMatch[1];
        console.log(color.bold.blue(provider));
    }

    switch (provider) {
        case 'google':
            console.log(color.bold.cyan('google'));
            break;
        case 'intra42':
            console.log(color.bold.cyan('intra42'));
            break;
        case 'github':
            console.log(color.bold.cyan('github'));
            break;
        default:
            reply.code(409).send({ error: "Wrong oauth provider." });
    }
}

async function manageRequest(fastify: FastifyInstance, database: Database) {

    fastify.all('/*', async(request, reply) => {
        const path = request.raw.url;
        console.log(request.body);
        console.log(color.bold.blue(path));

        switch (path) {
            case "/api/auth/login":
                logAccount(request, reply, database);
                break;
            case "/api/auth/register":
                registerAccount(request, reply, database);
                break;
            case path?.startsWith('/api/auth/oauth/'):
                if (path)
                    registerOAuth(path, request, reply, database);
                break;
            default:
                reply.code(404).send({ error: "Route not found "});
                break;
        }
    });
}

async function initAuthenticationService(fastify: FastifyInstance) : Promise<void> {
    fastify.register(fastifyCookie);
    fastify.register(fastifySession, {
        secret: crypto.randomBytes(32).toString('hex'),
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 3600 * 1000
        },
    });

    fastify.listen({ port: 3001, host: "0.0.0.0" }, function (err, address) {
    if (err) {
        fastify.log.error(err);
        throw err;
    }
    })
    console.log(color.white.bold("Authentication state: ") + color.green.bold.italic("running"));
}

function initDatabase() {
    return new Database();
}

function main() {

    const fastify = initFastifyInstance();
    const database = initDatabase();

    try {
        initAuthenticationService(fastify);
        // await initAuthenticationService(fastify).then(manageRequest(fastify, database)):
        // initSQLite3Database(betterSQLite3);
        manageRequest(fastify, database);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();