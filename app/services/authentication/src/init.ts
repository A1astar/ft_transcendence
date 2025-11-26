import Fastify, { FastifyInstance } from 'fastify';

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

import crypto from 'crypto';
import color from 'chalk';

export async function initAuthenticationService() {
    const fastify = Fastify({
        // AJV options for schema validation
        ajv: {
            customOptions: {},
            plugins: []
        },

        // Body size limit (bytes)
        bodyLimit: 1048576,                 // default: 1MB

        // Case sensitivity for routes
        // caseSensitive: true,                // default: true

        // Connection timeout (milliseconds)
        connectionTimeout: 0,               // default: 0 (disabled)

        // Disable request logging
        disableRequestLogging: false,       // default: false

        // Expose HEAD routes for GET routes
        exposeHeadRoutes: true,             // default: true

        // Force close connections on close
        forceCloseConnections: false,       // default: false

        // Custom request ID generator
        // genReqId: (req) => {                // default: incremental counter
        //     return `req-${Date.now()}-${Math.random()}`;
        // },

        // HTTP/2 support
        // http2: false,                       // default: false

        // HTTP/2 session timeout
        // http2SessionTimeout: 72000,         // default: 72000ms (72s)

        // HTTPS/TLS options
        // https: undefined,                   // default: undefined (provide { key, cert } for HTTPS)

        // Ignore trailing slashes in routes
        // ignoreTrailingSlash: false,         // default: false

        // Ignore duplicate slashes in routes
        // ignoreDuplicateSlashes: false,      // default: false

        // Keep-alive timeout
        keepAliveTimeout: 72000,            // default: 72000ms (Node.js default)

        // Logging configuration
        logger: false,                       // default: false (or pino options)

        // Max param length
        // maxParamLength: 100,                // default: 100

        // Max request headers count
        maxRequestsPerSocket: 0,            // default: 0 (unlimited)

        // On protocol error behavior
        // onProtocolError: 'error',           // default: 'error' | 'ignore'

        // Plugin timeout
        pluginTimeout: 10000,               // default: 10000ms (10s)

        // Query string parser
        // querystringParser: undefined,       // default: undefined (uses Node's)

        // Request ID header name
        requestIdHeader: false,             // default: false (or string header name)

        // Request ID log label
        requestIdLogLabel: 'reqId',         // default: 'reqId'

        // Request timeout
        requestTimeout: 0,                  // default: 0 (disabled)

        // Return 503 on closing
        return503OnClosing: true,           // default: true

        // Rewrite URL function
        rewriteUrl: undefined,              // default: undefined

        // Schema controller
        schemaController: undefined,        // default: undefined

        // Schema error formatter
        schemaErrorFormatter: undefined,    // default: undefined

        // Serializer options
        serializerOpts: {},                 // default: {}

        // Server factory (custom server)
        serverFactory: undefined,           // default: undefined

        // Trust proxy
        trustProxy: false,                  // default: false (or true, string, number, function)

        // Versioning options
        // versioning: undefined,              // default: undefined
    });

    fastify.register(fastifyCookie);

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
        saveUninitialized: true,         // default
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

    // Don't start listening here - let main() handle it
    console.log(color.gray('Fastify instance configured, ready for routes'));

    return fastify;
}