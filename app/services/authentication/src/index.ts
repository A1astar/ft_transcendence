import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import VaultClient from 'node-vault';

import crypto from 'crypto';
import color from 'chalk';

import { initAuthenticationService } from './init.js';
import { RegistrationFormat, UserFormat } from './format.js';
import Database, { SQLiteDatabase } from "./database.js";
import { printRequest } from './print.js';
import { User } from "./user.js";


function printSession(request: FastifyRequest) {
    console.log(color.bold.white('Session ID:'));
    console.log(color.bold.white('Cookie ID:'));
}

async function logAccount(request: FastifyRequest, reply: FastifyReply,
            database: Database, sqlite: SQLiteDatabase) : Promise<boolean> {

    console.log(color.bold.italic.yellow("----- LOGIN -----"));
    console.log(color.red('Raw body:'), JSON.stringify(request.body, null, 2));
    const user = request.body as UserFormat;

    return true;
}

function registerOAuth(path: string, request: FastifyRequest,
        reply: FastifyReply, database: Database, sqlite: SQLiteDatabase) {
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

async function manageRequest(fastify: FastifyInstance, sqlite: SQLiteDatabase, vaultClient: ReturnType<typeof VaultClient>) {

    fastify.all('/*', async(request, reply) => {
        const path = request.raw.url;

        console.log(color.bold.blue('Authentication'));
        switch (path) {
            case "/api/auth/login":
                logAccount(request, reply, vaultClient);
                break;
            case "/api/auth/register":
                // sqlite.registerAccount(request);
                sqlite.registerUser(request.body as RegistrationFormat);
                break;
            case path?.startsWith('/api/auth/oauth'):
                if (path)
                    registerOAuth(path, request, reply, vaultClient);
                break;
            default:
                reply.code(404).send({ error: "Route not found "});
                break;
        }
    });
}

async function main() {
    try {
        const fastify = initAuthenticationService();
        const sqlite = new SQLiteDatabase();
        const vaultClient = VaultClient({

        });
        await vaultClient.initialized();

        await manageRequest(fastify, sqlite, vaultClient);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();