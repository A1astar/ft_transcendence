import Fastify, { FastifyInstance } from 'fastify';
import * as oauth2 from "./oauth2.js";
import * as jwt from "./jwt.js";
import * as vault from "./vault.js";
import * as twoFA from "./2fa.js";
import * as session from "./session.js"
import chalk from 'chalk';

function manageLogin(fastify: FastifyInstance) {
    console.log(chalk.blue.bold("/auth"));
}

async function manageRequest(fastify: FastifyInstance) {
    fastify.all('*', async(request, reply) => { const path = request.raw.url;

        switch (path) {
            case "/auth":
                manageLogin(fastify);
                break;
            case "/auth/2fa":
                twoFA.manage2FA(fastify);
                break;
            case "/auth/jwt":
                jwt.manageJWT(fastify);
                break;
            case "/auth/oauth2":
                oauth2.manageOauth2(fastify);
                break;
            case "/auth/session":
                session.manageSession(fastify);
                break;
            case "/auth/vault":
                vault.manageVault(fastify);
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

    try {
        initAuthenticationService(fastify);
        manageRequest(fastify);

    } catch (err) {
        console.log(err);
    }
}

start();