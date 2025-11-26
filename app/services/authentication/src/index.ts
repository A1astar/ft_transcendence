import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import crypto from 'crypto';
import color from 'chalk';

import { initAuthenticationService } from './init.js';
import { RegistrationFormat, UserFormat, LoginFormat } from './format.js';
import { SQLiteDatabase } from "./database.js";
import { printRequest } from './print.js';
import { User } from "./user.js";
import { VaultService } from './vault.js';


function printSession(request: FastifyRequest) {
    console.log(color.bold.white('Session ID:'));
    console.log(color.bold.white('Cookie ID:'));
}

async function logAccount(request: FastifyRequest, reply: FastifyReply,
            sqlite: SQLiteDatabase, vaultClient: VaultService) : Promise<void> {

    console.log(color.bold.italic.yellow("----- LOGIN -----"));
    await sqlite.loginUser(request, reply);
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

        console.log(color.bold.blue('Authentication'), color.cyan(`${request.method} ${path}`));
        
        switch (path) {
            case "/api/auth/login":
                await logAccount(request, reply, sqlite, vaultClient);
                break;
            case "/api/auth/register":
                await sqlite.registerUser(request, reply);
                break;
            case "/api/auth/logout":
                // destroy session if present
                try {
                    const sess = (request as any).session;
                    if (sess && typeof sess.destroy === 'function') {
                        sess.destroy(() => {});
                    } else if (sess) {
                        // clear session object
                        for (const k of Object.keys(sess)) delete (sess as any)[k];
                    }
                    reply.code(200).send({ message: 'Logged out' });
                } catch (err) {
                    console.error('[auth] logout error', err);
                    reply.code(500).send({ error: 'Logout failed' });
                }
                break;
            case "/api/auth/userinfo":
                await sqlite.getUserinfo(request, reply);
                break;
            default:
                if (path?.startsWith('/api/auth/oauth/')) {
                    registerOAuth(path, request, reply, sqlite, vaultClient);
                } else {
                    reply.code(404).send({ error: "Route not found" });
                }
                break;
        }
    });
}

async function main() {
    try {
        const fastify = await initAuthenticationService();
        const sqlite = new SQLiteDatabase();
        const vaultClient = new VaultService();
        
        // Try to initialize Vault, but don't fail if it's not available
        try {
            await vaultClient.initialize();
        } catch (vaultError) {
            console.log(color.yellow('Vault not available, continuing without it'));
        }
        
        // Register routes BEFORE starting the server
        await manageRequest(fastify, sqlite, vaultClient);
        
        // Now start the server
        await fastify.listen({ port: 3001, host: "0.0.0.0" });
        //console.log(color.white.bold("Authentication state: ") + color.green.bold.italic("running"));
        console.log(color.green.bold("Authentication Service running on port 3001"));

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();