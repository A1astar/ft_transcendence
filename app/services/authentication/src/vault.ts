import VaultClient from 'node-vault'

interface VaultConfig {
    apiVersion?: string;
    endpoint?: string;
    token?: string;
    namespace?: string;
}

interface SecretData {
    [key: string]: any;
}

const VAULT_ADDR="http://localhost:8200"
const VAULT_TOKEN="empty"

export class VaultService {
    private client: any;
    private isInitialized: boolean = false;

    constructor(config?: VaultConfig) {
        const vaultConfig = {
            apiVersion: 'v1',
            // endpoint: process.env.VAULT_ADDR || 'http://hashicorp-vault:8200',
            // token: process.env.VAULT_TOKEN,
            requestOptions: {
                timeout: 5000,
            },
            ...config,
        };

        this.client = VaultClient(vaultConfig);
    }

    async initialize(): Promise<void> {
        try {
            const health = await this.client.health();
            console.log('Vault connected successfully');
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to connect to Vault:', error);
            throw new Error('Vault connection failed');
        }
    }

    async getSecret(path: string): Promise<SecretData | null> {
        try {
            const response = await this.client.read(`secret/data/${path}`);
            return response.data.data;
        } catch (error) {
            console.error(`Failed to read secret at ${path}:`, error);
            return null;
        }
    }

    async setSecret(path: string, data: SecretData): Promise<boolean> {
        try {
            await this.client.write(`secret/data/${path}`, {
                data: data,
            });
            return true;
        } catch (error) {
            console.error(`Failed to write secret at ${path}:`, error);
            return false;
        }
    }

    async deleteSecret(path: string): Promise<boolean> {
        try {
            await this.client.delete(`secret/data/${path}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete secret at ${path}:`, error);
            return false;
        }
    }

    // async getJWTConfig(): Promise<{ secret_key: string; expiry: string } | null> {
    //      return await this.getSecret('authentication/jwt');
    // }

    async getOAuthConfig(provider: string): Promise<any> {
        return await this.getSecret(`authentication/oauth/${provider}`);
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.client.health();
            return true;
        } catch (error) {
            return false;
        }
    }
}
