import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Database } from "./database.mjs"
import chalk from 'chalk';

/*
    --- credential ---
Credential

    --- authentication ---
Basic access authentication

    --- authorization ---

*/

function printRequest(request: FastifyRequest) {
    console.log(request.body);
}

function passwordValid(password: string) {
    if (password.length < 12 && password.length > 64)
        throw new Error("Password must contain a least 12 - 64 character");
    return true;
}

function logAccount(request: FastifyRequest, database: Database) {
    printRequest(request);

}

function registerAccount(request: FastifyRequest, database: Database) {
    printRequest(request);
}

async function manageRequest(fastify: FastifyInstance, database: Database) {

    fastify.all('/*', async(request, reply) => { const path = request.raw.url;

        switch (path) {
            case "/login":
                logAccount(request, database);
                break;
            case "/register":
                registerAccount(request, database);
                break;
            default:
                reply.code(404).send({ error: "Route not found "});
                break;
        }
    });
}

async function initAuthenticationService(fastify: FastifyInstance) {
    fastify.listen({ port: 3001, host: "0.0.0.0" }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        throw err
    }
    })
    console.log(chalk.white.bold("Authentication state: ") + chalk.green.bold.italic("running"));
}

async function start() {
    // const fastify = Fastify({ logger: true });
    const fastify = Fastify();
    const database = new Database();

    try {
        initAuthenticationService(fastify);
        manageRequest(fastify, database);

    } catch (err) {
        console.error(err);
    }
}

start();