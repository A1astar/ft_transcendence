// @ts-ignore - node-vault doesn't have proper TypeScript types
import nodeVault from 'node-vault'

class Vault {
    private vaultClient : any;

    constructor() {
        // @ts-ignore - node-vault module structure
        this.vaultClient = nodeVault({
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
    }
}

export default Vault;
