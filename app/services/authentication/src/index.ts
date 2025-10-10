import Fastify, { FastifyInstance } from 'fastify';
import * as oauth2 from "./oauth2";
import * as jwt from "./jwt";
import * as vault from "./vault";
import * as twoFA from "./2fa";
import chalk from 'chalk';

async function manageRequest(fastify: FastifyInstance) {
    fastify.all('*', async(request, reply) => { const path = request.raw.url;

        switch (path) {
            case "/auth":
                console.log(chalk.red.bold("/auth"));
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
}

async function start() {
    const fastify = Fastify({
        logger: true
    })

    try {
        initAuthenticationService(fastify);
        manageRequest(fastify);

    } catch (err) {
        console.log(err);
    }
}

start();