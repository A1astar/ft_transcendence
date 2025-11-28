import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

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

export interface Session {
    id: string,
    userId: string
}

export class SQLiteDatabase {
    private sqlite: BetterSQLite3Database;

    constructor() {
        this.sqlite = new BetterSQLite3("user-management.db", {
            // Read-only mode
            readonly: false,                    // default: false

            // File must exist (throws error if not)
            fileMustExist: false,              // default: false

            // Connection timeout (milliseconds)
            timeout: 5000,                     // default: 5000ms

            // Verbose mode - logs SQL statements
            verbose: undefined,                // default: undefined (or function to log)
            // verbose: console.log,           // Example: log all SQL

            // Native binding options
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
                INSERT INTO users (id, name, email, password)
                VALUES (?, ?, ?, ?)
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

            // Successful login
            console.log(chalk.green(`[auth] Login successful for user: ${validatedData.name}`));
            
            // Set session so the client receives a session cookie
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

            reply.code(200).send({ 
                id: user.id, 
                name: user.name, 
                email: user.email,
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
            const sess = (request as any).session;
            const userId = sess?.userId;
            if (!userId) {
                reply.code(401).send({ error: 'Not authenticated' });
                return;
            }

            const stmt = this.sqlite.prepare(`
                SELECT id, name as username, email
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
            });
        } catch (err) {
            console.error('[auth] getUserinfo error:', err);
            reply.code(500).send({ error: 'Server error' });
        }
    }
};