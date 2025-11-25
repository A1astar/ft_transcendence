import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import crypto from 'crypto';
import color from 'chalk';

import { initAuthenticationService } from './init.js';
import { RegistrationFormat, UserFormat } from './format.js';
import { SQLiteDatabase } from "./database.js";
import { printRequest } from './print.js';
import { User } from "./user.js";
import { VaultService } from './vault.js';


function printSession(request: FastifyRequest) {
    console.log(color.bold.white('Session ID:'));
    console.log(color.bold.white('Cookie ID:'));
}

async function logAccount(request: FastifyRequest, reply: FastifyReply,
            sqlite: SQLiteDatabase, vaultClient: VaultService) : Promise<boolean> {

    console.log(color.bold.italic.yellow("----- LOGIN -----"));
    console.log(color.red('Raw body:'), JSON.stringify(request.body, null, 2));
    const user = request.body as UserFormat;

    // TODO: Implement actual login flow using sqlite and vaultClient when ready
    return true;
}

function registerOAuth(path: string, request: FastifyRequest,
    reply: FastifyReply, sqlite: SQLiteDatabase, vaultClient: VaultService) {
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

async function manageRequest(fastify: FastifyInstance, sqlite: SQLiteDatabase, vaultClient: VaultService) {

    fastify.all('/*', async(request, reply) => {
        const path = request.raw.url;

        console.log(color.bold.blue('Authentication'));
        switch (path) {
            case "/api/auth/login":
                await logAccount(request, reply, sqlite, vaultClient);
                break;
            case "/api/auth/register":
                await sqlite.registerUser(request, reply);
                break;
            case path?.startsWith('/api/auth/oauth'):
                if (path)
                    registerOAuth(path, request, reply, sqlite, vaultClient);
                break;
            default:
                reply.code(404).send({ error: "Route not found "});
                break;
        }
    });
}

async function main() {
    try {
        const fastify = await initAuthenticationService();
        const sqlite = new SQLiteDatabase();
        const vaultClient = new VaultService();
        await vaultClient.initialize();

        await manageRequest(fastify, sqlite, vaultClient);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();