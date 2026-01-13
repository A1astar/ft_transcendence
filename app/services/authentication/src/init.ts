import fastifyOAuth2 from "@fastify/oauth2";
import fastifyCookie from "@fastify/cookie";
import { SQLiteDatabase } from "./database.js";
import { VaultService } from "./vault.js";
import fastifyJWT from "@fastify/jwt";
import { Auth } from "./auth.js";
import Fastify from "fastify";
import crypto from "crypto";

export async function initFastify(auth: Auth) {
  const fastify = Fastify({
    ajv: {
      customOptions: {},
      plugins: [],
    },
    bodyLimit: 1048576,
    // caseSensitive: true,
    connectionTimeout: 0,
    disableRequestLogging: false,
    exposeHeadRoutes: true,
    forceCloseConnections: false,
    // genReqId: (req) => {
    //     return `req-${Date.now()}-${Math.random()}`;
    // },
    // http2: false,
    // http2SessionTimeout: 72000,
    // https: undefined,
    // ignoreTrailingSlash: false,
    // ignoreDuplicateSlashes: false,
    keepAliveTimeout: 72000,
    logger: false,
    // maxParamLength: 100,
    maxRequestsPerSocket: 0,
    // onProtocolError: 'error',
    pluginTimeout: 10000,
    // querystringParser: undefined,
    requestIdHeader: false,
    requestIdLogLabel: "reqId",
    requestTimeout: 0,
    return503OnClosing: true,
    rewriteUrl: undefined,
    schemaController: undefined,
    schemaErrorFormatter: undefined,
    serializerOpts: {},
    serverFactory: undefined,
    trustProxy: true,
    // versioning: undefined,
  });

  fastify.register(fastifyCookie);

  // Load JWT secret from Vault (fallback to env). Avoid per-boot random secrets:
  // random secret => tokens break on restart / multi-replica deployments.
  let jwtCfg: any = null;
  try {
    jwtCfg = await auth.vault.getSecret("authentication/jwt");
  } catch (error) {
    console.error("[auth] JWT Vault load failed; falling back to env");
  }
  const shouldSeedJwt =
    process.env.AUTH_JWT_AUTO_SEED === "true" ||
    (process.env.NODE_ENV && process.env.NODE_ENV !== "production");
  let jwtSecret: string | undefined =
    (jwtCfg?.jwt_secret as string | undefined) || process.env.JWT_SECRET;
  if (!jwtSecret && shouldSeedJwt) {
    // Seed once into Vault for stable multi-container behavior
    jwtSecret = crypto.randomBytes(32).toString("hex");
    try {
      await auth.vault.setSecret("authentication/jwt", { jwt_secret: jwtSecret });
      console.log("[auth] Seeded JWT secret to Vault");
    } catch (e) {
      console.error("[auth] Failed to seed JWT secret to Vault:", e);
    }
  }
  if (!jwtSecret) {
    throw new Error(
      "JWT secret is missing. Set JWT_SECRET or store secret in Vault at secret/authentication/jwt (field: jwt_secret)."
    );
  }

  // Load OAuth credentials from Vault (fallback to env)
  let oauthCfg: any = null;
  try {
    oauthCfg = await auth.vault.getOAuthConfig("google");
  } catch (error) {
    console.error("[auth] OAuth Vault load failed; falling back to env");
  }
  const googleClientId =
    oauthCfg?.client_id || process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID";
  const googleClientSecret =
    oauthCfg?.client_secret ||
    process.env.GOOGLE_CLIENT_SECRET ||
    "GOOGLE_CLIENT_SECRET";
  const googleCallbackUrl =
    oauthCfg?.callback_url ||
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:8080/api/auth/oauth/google/callback";
  const googleScope = Array.isArray(oauthCfg?.scope)
    ? oauthCfg.scope
    : ["profile", "email"];

  fastify.register(fastifyOAuth2, {
    name: "googleOAuth2",
    scope: googleScope,
    credentials: {
      client: {
        id: googleClientId,
        secret: googleClientSecret,
      },
      auth: (fastifyOAuth2 as any).GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/api/auth/oauth/google",
    callbackUri: googleCallbackUrl,
  });

  fastify.register(
    fastifyJWT as any,
    {
      cookie: { cookieName: "access_token" },
      secret: jwtSecret,
      sign: {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      },
    } as any
  );

  return fastify;
}

export async function initAuthenticationService(): Promise<Auth | null> {
  const vaultClient = new VaultService();
  const sqlite = new SQLiteDatabase();
  const auth = new Auth(sqlite, vaultClient);

  try {
    await vaultClient.initialize();
  } catch (err) {
    console.error(err);
    console.error(
      "[auth] Vault initialization failed; proceeding without secrets"
    );
  }

  return auth;
}
