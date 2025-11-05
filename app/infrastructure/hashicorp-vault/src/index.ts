import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import HashiCorpVault from 'node-vault';

function main() {

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

    const vault = HashiCorpVault({
        // API version
        apiVersion: 'v1',                    // default: 'v1' (can be 'v1' or 'v2')

        // Vault server endpoint
        endpoint: 'http://vault:8200',       // default: process.env.VAULT_ADDR || 'http://127.0.0.1:8200'

        // Authentication token
        token: 'your-vault-token',           // default: process.env.VAULT_TOKEN

        // Namespace (Vault Enterprise feature)
        namespace: 'admin',                  // default: undefined

        // Path prefix for all requests
        pathPrefix: '',                      // default: '' (e.g., '/v1' is added automatically)


        // Custom request options (passed to 'request' library)
        requestOptions: {
            // Request timeout (milliseconds)
            timeout: 10000,                      // default: 10000 (10 seconds)

            // TLS/SSL options
            ca: undefined,                     // CA certificate
            cert: undefined,                   // Client certificate
            key: undefined,                    // Client key
            rejectUnauthorized: true,          // default: true (verify SSL certificates)

            // Proxy settings
            proxy: undefined,                  // HTTP proxy URL

            // Keep-alive
            forever: false,                    // default: false (use keep-alive)

            // Other HTTP options
            headers: {},                       // Custom headers
            agentOptions: {},                  // HTTP agent options
        },

        // Mustache-style templating for paths
        mustache: undefined,                 // default: undefined

        // Debug mode (logs requests)
        debug: undefined,                    // default: undefined

        // Custom status codes to treat as success
        noCustomHTTPVerbs: false,            // default: false

        // Custom HTTP client
        // rpInitialized: undefined,            // default: undefined (uses 'request-promise')
    });


    try {
        // initSQLite3Database(betterSQLite3);
        manageRequest(fastify, vault);

    } catch (err) {
        console.error(err);
    }
}

main();