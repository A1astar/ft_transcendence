import Fastify, { FastifyInstance } from 'fastify';

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

import crypto from 'crypto';
import color from 'chalk';

import fastifyOAuth2 from '@fastify/oauth2';

export async function initAuthenticationService() {
    const fastify = Fastify({
        ajv: {
            customOptions: {},
            plugins: []
        },
        bodyLimit: 1048576,                 // default: 1MB
        // caseSensitive: true,                // default: true
        connectionTimeout: 0,               // default: 0 (disabled)
        disableRequestLogging: false,       // default: false
        exposeHeadRoutes: true,             // default: true
        forceCloseConnections: false,       // default: false
        // genReqId: (req) => {                // default: incremental counter
        //     return `req-${Date.now()}-${Math.random()}`;
        // },
        // http2: false,                       // default: false
        // http2SessionTimeout: 72000,         // default: 72000ms (72s)
        // https: undefined,                   // default: undefined (provide { key, cert } for HTTPS)
        // ignoreTrailingSlash: false,         // default: false
        // ignoreDuplicateSlashes: false,      // default: false
        keepAliveTimeout: 72000,            // default: 72000ms (Node.js default)
        logger: false,                       // default: false (or pino options)
        // maxParamLength: 100,                // default: 100
        maxRequestsPerSocket: 0,            // default: 0 (unlimited)
        // onProtocolError: 'error',           // default: 'error' | 'ignore'
        pluginTimeout: 10000,               // default: 10000ms (10s)
        // querystringParser: undefined,    // default: undefined (uses Node's)
        requestIdHeader: false,             // default: false (or string header name)
        requestIdLogLabel: 'reqId',         // default: 'reqId'
        requestTimeout: 0,                  // default: 0 (disabled)
        return503OnClosing: true,           // default: true
        rewriteUrl: undefined,              // default: undefined
        schemaController: undefined,        // default: undefined
        schemaErrorFormatter: undefined,    // default: undefined
        serializerOpts: {},                 // default: {}
        serverFactory: undefined,           // default: undefined
        trustProxy: false,                  // default: false (or true, string, number, function)
        // versioning: undefined,              // default: undefined
    });

    fastify.register(fastifyCookie);

    fastify.register(fastifyOAuth2, {
        name: 'googleOAuth2',
        scope: ['profile', 'email'],
        credentials: {
            client: {
                id: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID',
                secret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET',
            },
            auth: (fastifyOAuth2 as any).GOOGLE_CONFIGURATION
        },
        startRedirectPath: '/api/auth/oauth/google',
        callbackUri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/api/auth/oauth/google/callback'
    });

    // JWT for stateless authentication (used alongside session cookies)
    fastify.register(fastifyJWT as any, {
        // In production, always set JWT_SECRET via environment / secret manager
        secret: process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex"),
        sign: {
            expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        },
    } as any);

    // Cast to any to avoid strict type mismatches with plugin option names
    fastify.register(fastifySession as any, {
        // required
        secret: crypto.randomBytes(32).toString('hex'),

        // @fastify/session top-level options (defaults shown)
        salt: undefined,                 // default internal value (version-dependent)
        cookieName: 'sessionId',         // default cookie name
        sessionName: 'session',          // default request decorator name
        store: undefined,                // default in-memory store (not for production)
        idGenerator: undefined,          // default internal id generator
        saveUninitialized: false,        // default
        rolling: false,                  // default
        ttl: undefined,                  // default (store decides; often based on cookie)

        // Cookie options (from @fastify/cookie / cookie-serialize)
        cookie: {
            path: '/',                   // default
            domain: undefined,           // default
            expires: undefined,          // default
            maxAge: undefined,           // default
            httpOnly: true,              // default for session cookies
            sameSite: undefined,         // default
            secure: 'auto',              // default (auto based on request)
            priority: undefined,         // default
            partitioned: undefined,      // default
            encode: undefined,           // default (internal encoder)
        },
    } as any);

    console.log(color.gray('Fastify instance configured, ready for routes'));

    return fastify;
}