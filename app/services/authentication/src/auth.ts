import { FastifyRequest, FastifyReply } from "fastify";
import { SQLiteDatabase } from "./database.js";
import { VaultService } from "./vault.js";
import { authenticator } from "otplib";
import crypto from "crypto";
import {
  validateRegistrationData,
  validateLoginData,
  ValidationError,
  sendValidationError,
  checkRateLimit,
} from "./validators.js";

type VaultUserSecrets = {
  salt?: string;
  passwordHash?: string;
  totpSecret?: string; //base 32
};

export class Auth {
  constructor(private db: SQLiteDatabase, public vault: VaultService) {}

  private normalizeEmail(email?: string) {
    return (email || "").trim().toLowerCase();
  }

  private getUserIdFromRequest(request: FastifyRequest): string | null {
    try {
      const headers: any = (request as any).headers || {};
      const authHeader: string | undefined = headers.authorization;
      const bearer = authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;
      const cookieToken = (request as any).cookies?.access_token as string | undefined;
      const token = cookieToken || bearer;
      if (!token) return null;
      const fastifyAny = (request as any).server as any;
      const payload = fastifyAny?.jwt?.verify ? fastifyAny.jwt.verify(token) : null;
      const userId = payload?.sub || payload?.id;
      return userId ? String(userId) : null;
    } catch {
      return null;
    }
  }

  async registerUser(request: FastifyRequest, reply: FastifyReply) {
    // Basic rate limit per IP
    const clientIp = request.ip || (request.headers["x-forwarded-for"] as string) || "unknown";
    if (!checkRateLimit(`register:${clientIp}`, 10, 60_000)) {
      return reply.code(429).send({ error: "Too many registration attempts. Try again later." });
    }

    try {
      const data = validateRegistrationData((request as any).body);
      const email = this.normalizeEmail(data.email);
      const password = data.password;
      const name = data.name ?? email.split("@")[0];

      const existing = await this.db.findUserByEmail(email);
      if (existing) return reply.code(409).send({ error: "Email already used." });

      // Create SQLite user (store placeholder in password to satisfy NOT NULL)
      const userId = await this.db.insertUser({
        email,
        name,
        passwordPlaceholder: "*vault*", // store actual secrets in Vault
      });
      if (!userId) return reply.code(500).send({ error: "User creation failed" });

      // Derive hash with scrypt and store in Vault
      const salt = crypto.randomBytes(16).toString("hex");
      const derivedKey = crypto.scryptSync(password, salt, 64) as Buffer;
      const passwordHash = derivedKey.toString("hex");

      await this.vault.setUserSecrets(String(userId), { salt, passwordHash });

      return reply.code(201).send({ id: userId, email, name });
    } catch (err) {
      if (err instanceof ValidationError) {
        return sendValidationError(reply, err);
      }
      console.error("[auth] registerUser", err);
      return reply.code(500).send({ error: "Registration failed" });
    }
  }

  async loginUser(request: FastifyRequest, reply: FastifyReply) {
    // Basic rate limit per IP
    const clientIp = request.ip || (request.headers["x-forwarded-for"] as string) || "unknown";
    if (!checkRateLimit(`login:${clientIp}`, 20, 60_000)) {
      return reply.code(429).send({ error: "Too many login attempts. Try again later." });
    }

    try {
      const data = validateLoginData((request as any).body);
      const identifier = this.normalizeEmail(data.email);
      const password = data.password;
      const token = (data.token || "").trim();

      let user = null as any;
      if (identifier.includes("@")) {
        user = await this.db.findUserByEmail(identifier);
      } else {
        user = await this.db.findUserByName(identifier);
      }
      if (!user) return reply.code(401).send({ error: "Invalid credentials" });

      // Read hash + salt from Vault
      const secrets = (await this.vault.getUserSecrets(String(user.id))) as VaultUserSecrets | null;
      if (!secrets?.salt || !secrets?.passwordHash) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const derivedKey = crypto.scryptSync(password, secrets.salt, 64) as Buffer;
      const providedHash = derivedKey.toString("hex");
      if (providedHash !== secrets.passwordHash) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      // 2FA
      if (user.two_factor_enabled) {
        if (!token || !secrets.totpSecret) {
          return reply.code(401).send({ error: "Two-factor authentication code required" });
        }
        const isTotpValid = authenticator.check(token, secrets.totpSecret);
        if (!isTotpValid) return reply.code(401).send({ error: "Invalid two-factor authentication code" });
      }

      this.issueJwt(request, reply, user);
      return reply.code(200).send({ message: "Login successful" });
    } catch (err) {
      if (err instanceof ValidationError) {
        return sendValidationError(reply, err);
      }
      console.error("[auth] loginUser", err);
      return reply.code(500).send({ error: "Login failed" });
    }
  }

  async enableTwoFactor(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserIdFromRequest(request);
      if (!userId) return reply.code(401).send({ error: "Unauthorized" });

      const user = await this.db.findUserById(userId);
      if (!user) return reply.code(404).send({ error: "User not found" });

      const current = ((await this.vault.getUserSecrets(userId)) || {}) as VaultUserSecrets;
      if (user.two_factor_enabled && current.totpSecret) {
        return reply.code(200).send({
          message: "Two-factor authentication already enabled",
          twoFactorEnabled: true,
        });
      }

      const secret = authenticator.generateSecret(); // base32
      await this.vault.setUserSecrets(userId, { ...current, totpSecret: secret });
      await this.db.updateUser(userId, { twoFactorEnabled: 1 });

      const issuer = "LordOfTranscendence";
      const otpauthUrl = authenticator.keyuri(user.name, issuer, secret);

      return reply.code(200).send({
        message: "Two-factor authentication enabled",
        twoFactorEnabled: true,
        secret,
        otpauthUrl,
      });
    } catch (err) {
      console.error("[auth] enableTwoFactor", err);
      return reply.code(500).send({ error: "Enable 2FA failed" });
    }
  }

  async disableTwoFactor(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.getUserIdFromRequest(request);
      if (!userId) return reply.code(401).send({ error: "Unauthorized" });

      const current = ((await this.vault.getUserSecrets(userId)) || {}) as VaultUserSecrets;
      delete current.totpSecret;
      await this.vault.setUserSecrets(userId, current);

      await this.db.updateUser(userId, { twoFactorEnabled: 0 });
      return reply.code(200).send({ message: "Two-factor authentication disabled" });
    } catch (err) {
      console.error("[auth] disableTwoFactor", err);
      return reply.code(500).send({ error: "Disable 2FA failed" });
    }
  }

  async getUserinfo(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Verify JWT if Authorization header is present; populates request.user
      try {
        if ((request as any).jwtVerify) {
          await (request as any).jwtVerify();
        }
      } catch (error) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const userId = this.getUserIdFromRequest(request);
      if (!userId) return reply.code(401).send({ error: "Unauthorized" });

      const user = await this.db.findUserById(userId);
      if (!user) return reply.code(404).send({ error: "Not found" });

      return reply.code(200).send({
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.name,
        twoFactorEnabled: !!user.two_factor_enabled,
      });
    } catch (err) {
      console.error("[auth] getUserinfo", err);
      return reply.code(500).send({ error: "Userinfo failed" });
    }
  }

  async loginOrRegisterOAuthUser(
    request: FastifyRequest,
    reply: FastifyReply,
    info: { email: string; name: string }
  ) {
    const email = this.normalizeEmail(info.email);
    let user = await this.db.findUserByEmail(email);
    if (!user) {
      const userId = await this.db.insertUser({
        email,
        name: info.name,
        passwordPlaceholder: "*vault*",
      });
      user = await this.db.findUserById(String(userId));
    }

    this.issueJwt(request, reply, user);
    return user;
  }

  private issueJwt(request: FastifyRequest, reply: FastifyReply, user: any): string {
    const fastifyAny = (request as any).server as any;
    if (!fastifyAny?.jwt) {
      throw new Error("JWT not configured");
    }
    const token: string = fastifyAny.jwt.sign({
      sub: user.id,
      name: user.name,
      email: user.email,
      twoFactorEnabled: !!user.two_factor_enabled,
    });
    try {
      (reply as any).setCookie?.("access_token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: "auto",
      });
    } catch {}
    return token;
  }

}
