import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

// import HashiCorpVault from 'node-vault';

import crypto from 'crypto';
import color from 'chalk';

import { initUserManagementService } from './init.js';
import Database, { SQLiteDatabase } from "./database.js";


function printSession(request: FastifyRequest) {
    console.log(color.bold.white('Session ID:'));
    console.log(color.bold.white('Cookie ID:'));
}

async function logAccount(request: FastifyRequest, reply: FastifyReply, database: Database, sqlite: SQLiteDatabase) : Promise<boolean> {
    console.log(color.bold.italic.yellow("----- LOGIN -----"));
    console.log(color.red('Raw body:'), JSON.stringify(request.body, null, 2));
    // const user = request.body as UserFormat;

    // console.log(color.bold.blue('username: ') + user.name);
    // console.log(color.bold.blue('password: ') + user.passwordHash);
    return true;
}

function registerOAuth(path: string, request: FastifyRequest, reply: FastifyReply, database: Database, sqlite: SQLiteDatabase) {
    let provider;
    const oauthMatch = path?.match(/^\/api\/auth\/oauth\/(\w+)/);

    if (oauthMatch) {
        provider = oauthMatch[1];
        console.log(color.bold.blue(provider));
    }

    switch (provider) {
        case 'intra42':
            console.log(color.bold.cyan('intra42'));
            break;
        default:
            reply.code(409).send({ error: "Wrong oauth provider." });
    }
}

async function manageRequest(fastify: FastifyInstance, sqlite: SQLiteDatabase) {

    fastify.all('/*', async(request, reply) => {
        const path = request.raw.url;
        console.log()

        switch (path) {
            case "/api/auth/login":
                logAccount(request, reply, database, sqlite);
                break;
            case "/api/auth/register":
                // sqlite.registerAccount(request);
                database.registerUser(request.body as RegistrationFormat);
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
        const fastify = initUserManagementService();
        const sqlite = new SQLiteDatabase();
        await manageRequest(fastify, sqlite);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();