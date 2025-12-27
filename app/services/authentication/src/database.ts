import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import { FastifyRequest, FastifyReply } from 'fastify';

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

import { AuthenticationFormat, RegistrationFormat, LoginFormat } from "./format.js";
import { User, generateId } from "./user.js";
import {
    validateRegistrationData,
    validateLoginData,
    ValidationError,
    sendValidationError,
    checkRateLimit
} from "./validators.js";

import crypto from 'crypto';
import chalk from 'chalk';
import { authenticator } from 'otplib';

export interface Session {
    id: string,
    userId: string
}

export class SQLiteDatabase {
    private sqlite: BetterSQLite3Database;

    constructor() {
        this.sqlite = new BetterSQLite3("database/user-management.db", {
            readonly: false,                   // default: false
            fileMustExist: false,              // default: false
            timeout: 5000,                     // default: 5000ms
            verbose: undefined,                // default: undefined (or function to log)
            // verbose: console.log,           // Example: log all SQL
            nativeBinding: undefined,          // default: undefined (path to native module)
        });

        this.sqlite.exec(`
                CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                pseudo TEXT,
                name TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `);

        // 2FA columns (added in a best-effort way; ignore errors if already exist)
        try {
            this.sqlite.exec(`
                ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;
            `);
        } catch (e) {
            // likely column already exists
        }
        try {
            this.sqlite.exec(`
                ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
            `);
        } catch (e) {
            // likely column already exists
        }
    }

    private async getAuthenticatedUserId(request: FastifyRequest): Promise<string | null> {
        // First, try session-based authentication
        try {
            const sess = (request as any).session;
            if (sess?.userId) {
                return String(sess.userId);
            }
        } catch {
            // ignore session errors and fall back to JWT
        }

        // Fallback to JWT-based authentication (Authorization: Bearer ...)
        try {
            const payload = await (request as any).jwtVerify?.();
            if (payload && payload.sub) {
                return String(payload.sub);
            }
        } catch {
            // invalid/missing JWT
        }

        return null;
    }

    async registerUser(request: FastifyRequest, reply: FastifyReply) : Promise<void> {
        // Rate limiting - prevent abuse
        const clientIp = request.ip || 'unknown';
        if (!checkRateLimit(`register:${clientIp}`, 10, 60000)) {
            reply.code(429).send({ error: 'Too many registration attempts. Please try again later.' });
            return;
        }

        try {
            // Validate and sanitize input
            const validatedData = validateRegistrationData(request.body);

            const id = crypto.randomUUID();
            // Hash password using scrypt with a random salt
            const salt = crypto.randomBytes(16).toString('hex');
            const derivedKey = crypto.scryptSync(validatedData.password, salt, 64) as Buffer;
            const passwordStored = `${salt}:${derivedKey.toString('hex')}`;

            const stmt = this.sqlite.prepare(`
                INSERT INTO users (id, name, email, password, two_factor_enabled, two_factor_secret)
                VALUES (?, ?, ?, ?, 0, NULL)
            `);

            try {
                stmt.run(id, validatedData.name, validatedData.email, passwordStored);

                // Explicitly clear any session data to prevent auto-login after registration
                try {
                    const sess = (request as any).session;
                    if (sess) {
                        // Clear session to ensure user must login explicitly
                        for (const key of Object.keys(sess)) {
                            delete (sess as any)[key];
                        }
                    }
                } catch (e) {
                    // Session clearing failed, but registration succeeded
                    console.warn('[auth] Failed to clear session after registration:', e);
                }

                reply.code(201).send({
                    id,
                    name: validatedData.name,
                    email: validatedData.email
                });
            } catch (error: any) {
                console.error('[auth] registerUser database error:', error);
                if (error && error.code === 'SQLITE_CONSTRAINT') {
                    reply.code(409).send({ error: 'User with this name or email already exists' });
                    return;
                }
                reply.code(500).send({ error: 'Failed to register user' });
                return;
            }

            this.printDatabase();
        } catch (error) {
            if (error instanceof ValidationError) {
                sendValidationError(reply, error);
            } else {
                console.error('[auth] registerUser unexpected error:', error);
                reply.code(500).send({ error: 'Internal server error' });
            }
        }
    }

    printDatabase() {
        // this.sqlite.
    }

    async loginUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        // Rate limiting - prevent brute force attacks
        const clientIp = request.ip || 'unknown';
        if (!checkRateLimit(`login:${clientIp}`, 20, 60000)) {
            reply.code(429).send({ error: 'Too many login attempts. Please try again later.' });
            return;
        }

        try {
            // Validate and sanitize input
            const validatedData = validateLoginData(request.body);

            console.log('[auth] loginUser - attempting login for user:', validatedData.name);

            // Get user from database
            const stmt = this.sqlite.prepare(`
                SELECT id, name, email, password, created_at
                FROM users
                WHERE name = ?
            `);

            const user = stmt.get(validatedData.name) as any;

            if (!user) {
                console.log(`[auth] User not found: ${validatedData.name}`);
                reply.code(401).send({ error: 'Invalid credentials' });
                return;
            }

            // Verify password
            const [salt, storedHash] = user.password.split(':');
            const derivedKey = crypto.scryptSync(validatedData.password, salt, 64) as Buffer;
            const providedHash = derivedKey.toString('hex');

            if (providedHash !== storedHash) {
                console.log(`[auth] Password mismatch for user: ${validatedData.name}`);
                reply.code(401).send({ error: 'Invalid credentials' });
                return;
            }

            // If 2FA is enabled for this user, require a valid TOTP code
            if (user.two_factor_enabled) {
                const body: any = request.body || {};
                const twoFactorCode = body.twoFactorCode || body.otp || body.code;

                if (!twoFactorCode || typeof twoFactorCode !== 'string') {
                    reply.code(401).send({
                        error: 'Two-factor authentication code required',
                        twoFactorRequired: true,
                    });
                    return;
                }

                const isValid = authenticator.check(twoFactorCode, user.two_factor_secret);
                if (!isValid) {
                    reply.code(401).send({ error: 'Invalid two-factor authentication code' });
                    return;
                }
            }

            // Successful login
            console.log(chalk.green(`[auth] Login successful for user: ${validatedData.name}`));
<<<<<<< HEAD

            // Set session so the client receives a session cookie (for backwards compatibility)
=======

            // Set session so the client receives a session cookie
>>>>>>> feature/hcp-vault
            try {
                const sess = (request as any).session;
                if (sess) {
                    sess.userId = user.id;
                    sess.username = user.name;
                }
            } catch (e) {
                // If session isn't available, continue without failing login
                console.warn('[auth] session unavailable, continuing without session');
            }

<<<<<<< HEAD
            // Issue JWT for stateless authentication
            let token: string | null = null;
            try {
                const fastifyAny = (request as any).server as any;
                if (fastifyAny?.jwt) {
                    token = fastifyAny.jwt.sign({
                        sub: user.id,
                        name: user.name,
                        email: user.email,
                        twoFactorEnabled: !!user.two_factor_enabled,
                    });
                }
            } catch (e) {
                console.error('[auth] failed to sign JWT:', e);
            }

            if (token) {
                // Optionally, also send as HTTP-only cookie for browser-based flows
                try {
                    (reply as any).setCookie?.('access_token', token, {
                        httpOnly: true,
                        sameSite: 'lax',
                        path: '/',
                        secure: 'auto',
                    });
                } catch {
                    // ignore cookie errors
                }
            }

            reply.code(200).send({
                id: user.id,
                name: user.name,
=======
            reply.code(200).send({
                id: user.id,
                name: user.name,
>>>>>>> feature/hcp-vault
                email: user.email,
                token: token || undefined,
                message: 'Login successful'
            });

        } catch (error) {
            if (error instanceof ValidationError) {
                sendValidationError(reply, error);
            } else {
                console.error('[auth] loginUser unexpected error:', error);
                reply.code(500).send({ error: 'Internal server error during login' });
            }
        }
    }

    async getUserinfo(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            // Prefer session if present, otherwise fall back to JWT
            let userId: string | null = null;

            try {
                const sess = (request as any).session;
                if (sess?.userId) {
                    userId = String(sess.userId);
                }
            } catch {
                // ignore and fall back to JWT
            }

            if (!userId) {
                try {
                    const jwtVerify = (request as any).jwtVerify;
                    const payload = jwtVerify ? await jwtVerify() : null;
                    if (payload?.sub) {
                        userId = String(payload.sub);
                    }
                } catch {
                    // invalid or missing JWT
                }
            }

            if (!userId) {
                reply.code(401).send({ error: 'Not authenticated' });
                return;
            }

            const stmt = this.sqlite.prepare(`
                SELECT id, name as username, email,
                       COALESCE(two_factor_enabled, 0) AS two_factor_enabled
                FROM users
                WHERE id = ?
            `);

            const user = stmt.get(userId) as any;
            if (!user) {
                reply.code(401).send({ error: 'Not authenticated' });
                return;
            }

            // Basic stats placeholders; replace with real aggregates if you have a games table
            const gamePlayed = 0;
            const gameWon = 0;
            const gameLost = 0;
            const winRate = 0;

            reply.code(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                gamePlayed,
                gameWon,
                gameLost,
                winRate,
                twoFactorEnabled: !!user.two_factor_enabled,
            });
        } catch (err) {
            console.error('[auth] getUserinfo error:', err);
            reply.code(500).send({ error: 'Server error' });
        }
    }

    /**
     * Enable TOTP-based 2FA for the authenticated user.
     * Returns the shared secret so the user can configure an authenticator app.
     */
    async enableTwoFactor(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const userId = await this.getAuthenticatedUserId(request);
            if (!userId) {
                reply.code(401).send({ error: 'Not authenticated' });
                return;
            }

            const getStmt = this.sqlite.prepare(`
                SELECT id, name, email, two_factor_enabled, two_factor_secret
                FROM users
                WHERE id = ?
            `);
            const user = getStmt.get(userId) as any;
            if (!user) {
                reply.code(404).send({ error: 'User not found' });
                return;
            }

            if (user.two_factor_enabled && user.two_factor_secret) {
                // Already enabled; do not regenerate secret silently
                reply.code(200).send({
                    message: 'Two-factor authentication already enabled',
                    twoFactorEnabled: true,
                });
                return;
            }

            const secret = authenticator.generateSecret();
            const updateStmt = this.sqlite.prepare(`
                UPDATE users
                SET two_factor_enabled = 1,
                    two_factor_secret = ?
                WHERE id = ?
            `);
            updateStmt.run(secret, userId);

            const issuer = 'LordOfTranscendence';
            const otpauthUrl = authenticator.keyuri(user.name, issuer, secret);

            reply.code(200).send({
                message: 'Two-factor authentication enabled',
                twoFactorEnabled: true,
                secret,
                otpauthUrl,
            });
        } catch (err) {
            console.error('[auth] enableTwoFactor error:', err);
            reply.code(500).send({ error: 'Failed to enable two-factor authentication' });
        }
    }

    /**
     * Disable TOTP-based 2FA for the authenticated user.
     */
    async disableTwoFactor(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const userId = await this.getAuthenticatedUserId(request);
            if (!userId) {
                reply.code(401).send({ error: 'Not authenticated' });
                return;
            }

            const updateStmt = this.sqlite.prepare(`
                UPDATE users
                SET two_factor_enabled = 0,
                    two_factor_secret = NULL
                WHERE id = ?
            `);
            updateStmt.run(userId);

            reply.code(200).send({
                message: 'Two-factor authentication disabled',
                twoFactorEnabled: false,
            });
        } catch (err) {
            console.error('[auth] disableTwoFactor error:', err);
            reply.code(500).send({ error: 'Failed to disable two-factor authentication' });
        }
    }

    async loginOrRegisterOAuthUser(request: FastifyRequest, oauthUser: { email: string, name: string }): Promise<any> {
        // Check if user exists by email
        const stmt = this.sqlite.prepare(`
            SELECT id, name, email, password
            FROM users
            WHERE email = ?
        `);
        let user = stmt.get(oauthUser.email) as any;

        if (!user) {
            // Register new user
            const id = crypto.randomUUID();
            // Generate a random password for OAuth users
            const password = crypto.randomBytes(16).toString('hex');
            const salt = crypto.randomBytes(16).toString('hex');
            const derivedKey = crypto.scryptSync(password, salt, 64) as Buffer;
            const passwordStored = `${salt}:${derivedKey.toString('hex')}`;

            // Handle potential name collision
            let name = oauthUser.name;
            let suffix = 1;
            while (true) {
                 const nameCheck = this.sqlite.prepare('SELECT 1 FROM users WHERE name = ?').get(name);
                 if (!nameCheck) break;
                 name = `${oauthUser.name}${suffix++}`;
            }

            const insertStmt = this.sqlite.prepare(`
                INSERT INTO users (id, name, email, password)
                VALUES (?, ?, ?, ?)
            `);
            insertStmt.run(id, name, oauthUser.email, passwordStored);
            user = { id, name, email: oauthUser.email };
        }

        // Set session
        const sess = (request as any).session;
        if (sess) {
            sess.userId = user.id;
            sess.username = user.name;
        }

        return user;
    }
};