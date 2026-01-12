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

    // Load OAuth credentials from Vault (fallback to env)
  let oauthCfg: any = null;
  try {
    oauthCfg = await auth.vault.getOAuthConfig('google');
  } catch (error) {
    console.error('[auth] OAuth Vault load failed; falling back to env');
  }
  const googleClientId = oauthCfg?.client_id || process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID';
  const googleClientSecret = oauthCfg?.client_secret || process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET';
  const googleCallbackUrl = oauthCfg?.callback_url || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/api/auth/oauth/google/callback';
  const googleScope = Array.isArray(oauthCfg?.scope) ? oauthCfg.scope : ['profile', 'email'];

  fastify.register(fastifyOAuth2, {
    name: 'googleOAuth2',
    scope: googleScope,
    credentials: {
      client: {
        id: googleClientId,
        secret: googleClientSecret,
      },
      auth: (fastifyOAuth2 as any).GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/api/auth/oauth/google',
    callbackUri: googleCallbackUrl,
  });

  fastify.register(
    fastifyJWT as any,
    {
      cookie: { cookieName: "access_token" },
      secret: process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex"),
      sign: {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      },
    } as any
  );

  return fastify;
}

export async function initAuthenticationService() : Promise<Auth | null >{
  const vaultClient = new VaultService();
  const sqlite = new SQLiteDatabase();
  const auth = new Auth(sqlite, vaultClient);

  try {
    await vaultClient.initialize();
  } catch (err) {
    console.error(err);
    console.error("[auth] Vault initialization failed; proceeding without secrets");
  }

  return auth;
}