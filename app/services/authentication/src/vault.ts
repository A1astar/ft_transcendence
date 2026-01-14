import VaultClient from "node-vault";
import path from "path";
import fs from "fs";

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
    const runPath = `/run/secrets/${name}`;
    if (fs.existsSync(runPath)) return fs.readFileSync(runPath, "utf-8").trim();
    const vaultPath = `/vault/secrets/${name}`;
    if (fs.existsSync(vaultPath))
      return fs.readFileSync(vaultPath, "utf-8").trim();
  } catch {}
  return undefined;
}

export type UserSecrets = {
  salt?: string;
  passwordHash?: string;
  totpSecret?: string;
};

export class VaultService {
  private client: any;
  private isInitialized: boolean = false;

  constructor(config?: VaultConfig) {
    const vaultConfig = {
      apiVersion: "v1",
      endpoint: process.env.VAULT_ADDR || "https://hashicorp-vault:8200",
      token: process.env.VAULT_TOKEN,
      requestOptions: {
        timeout: 5000,
        ca: (() => {
          try {
            const path = process.env.VAULT_CA_PATH || "/etc/ssl/vault/ca.crt";
            const fs = require("fs");
            if (fs.existsSync(path)) return fs.readFileSync(path);
          } catch (error) {}
          return undefined;
        })(),
      },
      ...config,
    };

    this.client = VaultClient(vaultConfig);
  }

  private readBootstrapField(
    field: "role_id" | "secret_id"
  ): string | undefined {
    try {
      const file = path.join("/vault/data/bootstrap", "approle.json");
      if (fs.existsSync(file)) {
        const text = fs.readFileSync(file, "utf-8");
        const json = JSON.parse(text);
        const value = json?.[field];
        return typeof value === "string" ? value : undefined;
      }
    } catch {
      // ignore file errors
    }
    return undefined;
  }

  async initialize(): Promise<void> {
    try {
      // Wait for Vault to be unsealed before login
      for (let i = 0; i < 60; i++) {
        const health = await this.client.health();
        if (!health.sealed) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Prefer AppRole via live secrets mounted at /run/secrets
      const roleId =
        process.env.VAULT_APPROLE_ROLE_ID ||
        readDockerSecret("vault_approle_role_id") ||
        readDockerSecret("approle_role_id") ||
        this.readBootstrapField("role_id");
      const secretId =
        process.env.VAULT_APPROLE_SECRET_ID ||
        readDockerSecret("vault_approle_secret_id") ||
        readDockerSecret("approle_secret_id") ||
        this.readBootstrapField("secret_id");

      if (roleId && secretId) {
        const login = await this.client.write("auth/approle/login", {
          role_id: roleId,
          secret_id: secretId,
        });
        const token = login?.auth?.client_token;
        if (token) this.client.token = token;
      }

      // Preload OAuth config and optionally seed from env (dev-safe)
      try {
        const googleCfg = await this.getSecret("authentication/oauth/google");
        const shouldSeed =
          process.env.AUTH_OAUTH_AUTO_SEED === "true" ||
          (process.env.NODE_ENV && process.env.NODE_ENV !== "production");
        if (
          !googleCfg &&
          (process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_SECRET) &&
          shouldSeed
        ) {
          const seed = {
            client_id: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID",
            client_secret:
              process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET",
            callback_url:
              process.env.GOOGLE_CALLBACK_URL ||
              "http://localhost:8080/api/auth/oauth/google/callback",
            scope: ["profile", "email"],
          };
          await this.setSecret("authentication/oauth/google", seed);
          console.log("[auth] Seeded OAuth config to Vault");
        }
      } catch (error) {
        console.error("[auth] OAuth preload failed:", error);
      }
      const health = await this.client.health();
      this.isInitialized = true;
      console.log("Vault connected successfully:", health);
    } catch (error) {
      console.error("Failed to connect to Vault:", error);
      throw new Error("Vault connection failed");
    }
  }

  async getSecret(path: string): Promise<SecretData | null> {
    try {
      const response = await this.client.read(`secret/data/${path}`);
      return response.data.data;
    } catch (error: any) {
      const status = error?.response?.statusCode;
      if (status === 404 || status === 403) {
        // Secret not found: return null without error noise
        return null;
      }
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

  async setOAuthConfig(provider: string, data: any): Promise<boolean> {
    return await this.setSecret(`authentication/oauth/${provider}`, data);
  }

  // Helpers for per-user credentials stored in KV v2
  private usersPathPrefix(): string {
    return process.env.VAULT_USERS_PATH_PREFIX || "authentication/users";
  }

  async getUserSecrets(userId: string): Promise<UserSecrets | null> {
    return (await this.getSecret(
      `${this.usersPathPrefix()}/${userId}`
    )) as UserSecrets | null;
  }

  async setUserSecrets(userId: string, data: UserSecrets): Promise<boolean> {
    return await this.setSecret(`${this.usersPathPrefix()}/${userId}`, data);
  }

  async deleteUserSecrets(userId: string): Promise<boolean> {
    return await this.deleteSecret(`${this.usersPathPrefix()}/${userId}`);
  }

  // JWT signing key management
  async getJwtKey(): Promise<string | null> {
    try {
      const v = await this.getSecret("authentication/jwt");
      const k = v?.signing_key;
      return typeof k === "string" ? k : null;
    } catch {
      return null;
    }
  }

  async setJwtKey(key: string): Promise<boolean> {
    return await this.setSecret("authentication/jwt", { signing_key: key });
  }
}
