import VaultClient from 'node-vault'
import fs from 'fs'
import path from 'path'

interface VaultConfig {
    apiVersion?: string;
    endpoint?: string;
    token?: string;
    namespace?: string;
}

interface SecretData {
    [key: string]: any;
}

function readDockerSecret(name: string): string | undefined {
  try {
    const p = `/run/secrets/${name}`;
    if (fs.existsSync(p))
      return fs.readFileSync(p, "utf-8").trim();
  } catch {}
  return undefined;
}

export class VaultService {
    private client: any;
    private isInitialized: boolean = false;

    constructor(config?: VaultConfig) {
        const vaultConfig = {
            apiVersion: 'v1',
            endpoint: process.env.VAULT_ADDR || 'https://hashicorp-vault:8200',
            token: process.env.VAULT_TOKEN,
            requestOptions: {
                timeout: 5000,
                ca: (() => {
                    try {
                        const p = process.env.VAULT_CA_PATH || '/etc/ssl/vault/ca.crt';
                        const fs = require('fs');
                        if (fs.existsSync(p))
                          return fs.readFileSync(p);
                    } catch (e) {}
                    return undefined;
                })(),
            },
            ...config,
        };

        this.client = VaultClient(vaultConfig);
    }

    private readBootstrapField(field: 'role_id' | 'secret_id'): string | undefined {
        try {
            const file = path.join('/vault/data/bootstrap', 'approle.json');
            if (fs.existsSync(file)) {
                const text = fs.readFileSync(file, 'utf-8');
                const json = JSON.parse(text);
                const value = json?.[field];
                return typeof value === 'string' ? value : undefined;
            }
        } catch {
            // ignore file errors
        }
        return undefined;
    }

    async initialize(): Promise<void> {
        try {
            // If AppRole credentials are provided via env or shared file, login to obtain a client token
            const roleId = readDockerSecret('vault_approle_role_id') || process.env.VAULT_ROLE_ID || this.readBootstrapField('role_id');
            const secretId = readDockerSecret('vault_approle_secret_id') || process.env.VAULT_SECRET_ID || this.readBootstrapField('secret_id');

            if (roleId && secretId) {
                const login = await this.client.write('auth/approle/login', {
                    role_id: roleId,
                    secret_id: secretId,
                });
                const token = login?.auth?.client_token;
                if (token) {
                    // Update the client token for subsequent requests
                    this.client.token = token;
                    console.log('Vault AppRole login succeeded');
                } else {
                    console.warn('Vault AppRole login did not return a token; falling back to configured token');
                }
            }

            const health = await this.client.health();
            console.log('Vault connected successfully:', health);
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
