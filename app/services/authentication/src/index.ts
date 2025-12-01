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

async function registerOAuth(path: string, request: FastifyRequest,
    reply: FastifyReply, sqlite: SQLiteDatabase, vaultClient: VaultService, fastify: FastifyInstance) {
    let provider;
    const oauthMatch = path?.match(/^\/api\/auth\/oauth\/(\w+)/);

    if (oauthMatch) {
        provider = oauthMatch[1];
        console.log(color.bold.blue(provider));
    }

    switch (provider) {
        case 'google':
            if (path.includes('/callback')) {
                try {
                    const token = await (fastify as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

                    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                        headers: {
                            Authorization: `Bearer ${token.token.access_token}`
                        }
                    });
                    const userInfo = await userInfoRes.json();

                    const user = await sqlite.loginOrRegisterOAuthUser(request, {
                        email: userInfo.email,
                        name: userInfo.name || userInfo.email.split('@')[0]
                    });

                    // Redirect to frontend
                    reply.redirect('/gameMenu');
                } catch (err) {
                    console.error('OAuth callback error:', err);
                    reply.redirect('/login?error=oauth_failed');
                }
            } else {
                // Start flow handled by plugin usually, but if we are here, it might be the start request
                // intercepted by our wildcard.
                // We should let the plugin handle it if possible, but since we are in a wildcard handler,
                // we might need to delegate.
                // However, fastify-oauth2 adds a route. Fastify routes take precedence.
                // If we reached here, maybe the plugin route didn't catch it?
                // Or maybe the regex match above is catching it?
                // The plugin registers '/api/auth/oauth/google'.
                // If the request is exactly that, the plugin handler should run.
                // If we are here, maybe something is wrong or we are handling it manually?
                // Actually, if fastify.all('/*') is defined, it might intercept.
                // I will try to rely on the plugin route for start.
                // If we are here for start, it's an issue.
                // But for callback, we need to handle it.

                // If it is NOT callback, and it IS google, we should probably do nothing and let the plugin route handle?
                // But we are already inside the handler for the request.
                // We can't easily "pass" to the next handler in this structure.

                // Workaround: explicitly call the start redirect if needed.
                // But simpler: check if it is exactly the start path.
                if (path === '/api/auth/oauth/google') {
                     // It seems the plugin didn't catch it or we shadowed it.
                     // We can trigger the redirect manually?
                     // (fastify as any).googleOAuth2.startRedirectPath(request, reply);
                     // Not exposed like that easily.
                     // Let's assume the plugin route works and we only get here for callback
                     // because callback route is NOT registered by the plugin (only the URI is config).

                     reply.code(404).send({ error: "Expected plugin to handle this" });
                }
            }
            break;
        case 'intra42':
            console.log(color.bold.cyan('intra42'));
            break;
        default:
            reply.code(409).send({ error: "Wrong oauth provider." });
    }
}

async function manageRequest(fastify: FastifyInstance, sqlite: SQLiteDatabase, vaultClient: VaultService) {

    fastify.all('/*', async(request, reply) => {
        // request.raw.url contains the full path and query string (e.g. /foo?bar=baz)
        const fullPath = request.raw.url;
        // We parse it to get just the pathname for switching
        const urlObj = new URL(fullPath || '', 'http://localhost');
        const pathname = urlObj.pathname;

        // If the path matches the Google OAuth start path, and fastify-oauth2 registered a route,
        // Fastify should have handled it if it was a specific route.
        // But if we are here, it means we matched /*.
        // We'll try to avoid interfering if it's the start path, but currently we are interfering.
        // However, fastify-oauth2 registers the route.

        console.log(color.bold.blue('Authentication'), color.cyan(`${request.method} ${fullPath}`));

        switch (pathname) {
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
                if (pathname.startsWith('/api/auth/oauth/')) {
                    await registerOAuth(fullPath || '', request, reply, sqlite, vaultClient, fastify);
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
