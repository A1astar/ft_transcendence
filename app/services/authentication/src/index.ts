import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

// import HashiCorpVault from 'node-vault';

import crypto from 'crypto';
import color from 'chalk';

import { initFastifyInstance, initAuthenticationService } from './init.js';
import Database, { initSQLite3Database } from "./database.js";
import { RegistrationFormat, UserFormat } from './format.js';
import { printRequest } from './print.js';
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
    // console.log(color.blue(request.session.sessionId));
    console.log(color.bold.white('Cookie ID:'));
    // console.log(color.blue(request.cookies['id']));
}

async function logAccount(request: FastifyRequest, reply: FastifyReply, database: Database, sqlite: BetterSQLite3Database) : Promise<boolean> {
    console.log(color.bold.italic.yellow("----- LOGIN -----"));
    console.log(color.red('Raw body:'), JSON.stringify(request.body, null, 2));
    const user = request.body as UserFormat;

    console.log(color.bold.blue('username: ') + user.name);
    console.log(color.bold.blue('password: ') + user.passwordHash);
    return true;
}

async function registerAccount(request: FastifyRequest, reply: FastifyReply, database: Database, sqlite: BetterSQLite3Database) : Promise<void> {

    console.log(color.bold.italic.yellow("\n----- REGISTER -----"));

    database.registerUser(request.body as RegistrationFormat);
    sqlite.prepare();
    try {
        const stmt = sqlite.prepare(`
        `);

    } catch () {
        sqlite.exec('

        ');
    }
    database.printDatabase();

    reply.setCookie(
        'sessionId', 'sessionTest', { httpOnly: true });
}

function registerOAuth(path: string, request: FastifyRequest, reply: FastifyReply, database: Database, sqlite: BetterSQLite3Database) {
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

async function manageRequest(fastify: FastifyInstance, database: Database, sqlite: BetterSQLite3Database) {

    fastify.all('/*', async(request, reply) => {
        const path = request.raw.url;
        printRequest(request);
        console.log()

        switch (path) {
            case "/api/auth/login":
                logAccount(request, reply, database, sqlite);
                break;
            case "/api/auth/register":
                await registerAccount(request, reply, database, sqlite);
                break;
            case path?.startsWith('/api/auth/oauth'):
                if (path)
                    registerOAuth(path, request, reply, database, sqlite);
                break;
            default:
                reply.code(404).send({ error: "Route not found "});
                break;
        }
    });
}

async function main() {
    try {
        const fastify = initFastifyInstance();
        const sqlite = initSQLite3Database();
        const database = new Database();
        initAuthenticationService(fastify);
        await manageRequest(fastify, database, sqlite);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();