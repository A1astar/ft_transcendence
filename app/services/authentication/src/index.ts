import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Database } from "./database.mjs"
import chalk from 'chalk';

function printRequest(request: FastifyRequest) {
    console.log(chalk.bold.blue('Request:'));
    console.log(request.method);
    console.log(request.headers);
    console.log(request.body);
}

function passwordValid(password: string) {
    if (password.length < 12 && password.length > 64)
        throw new Error("Password must contain a least 12 - 64 character");
    return true;
}

function logAccount(request: FastifyRequest, database: Database) {
    console.log(chalk.bold.italic.yellow("Log\n"));
    printRequest(request);
}

function accountFormatCorrect() : boolean {
    return true;
}

function registerAccount(request: FastifyRequest, database: Database) {

    console.log(chalk.bold.italic.yellow("Register\n"));
    printRequest(request);
    if (accountFormatCorrect())
        return;
    // database.addUser(user);
}

async function manageRequest(fastify: FastifyInstance, database: Database) {

    fastify.all('/*', async(request, reply) => {
        const path = request.raw.url;
        
        switch (path) {
            case "/auth/login":
                logAccount(request, database);
                break;
            case "/auth/register":
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
        logger: true,                       // default: false (or pino options)

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
    // const fastify = Fastify();
    const database = new Database();

    try {
        initAuthenticationService(fastify);
        manageRequest(fastify, database);

    } catch (err) {
        console.error(err);
    }
}

start();