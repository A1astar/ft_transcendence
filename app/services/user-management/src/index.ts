import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import Database, { SQLiteDatabase } from "./database.js";
import { initUserManagementService } from './init.js';

import color from 'chalk';

function printSession(request: FastifyRequest) {
    console.log(color.bold.white('Session ID:'));
    console.log(color.bold.white('Cookie ID:'));
}

async function manageRequest(fastify: FastifyInstance, sqlite: SQLiteDatabase) {

    fastify.all('/*', async(request, reply) => {
        const path = request.raw.url;
        console.log()

        switch (path) {
            case "/api/user/settings":
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