import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

import { AuthenticationFormat, RegistrationFormat, LoginFormat } from "./format.js";
import { User, generateId } from "./user.js";

import crypto from 'crypto';
import color from 'chalk';

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
        const body = request.body as RegistrationFormat;
        console.log('[auth] registerUser body:', JSON.stringify(body));

        if (!body || !body.name || !body.password) {
            reply.code(400).send({ error: 'Invalid registration payload' });
            return;
        }

        const id = crypto.randomUUID();

        // Hash password using scrypt with a random salt
        const salt = crypto.randomBytes(16).toString('hex');
        const derivedKey = crypto.scryptSync(body.password, salt, 64) as Buffer;
        const passwordStored = `${salt}:${derivedKey.toString('hex')}`;

        const stmt = this.sqlite.prepare(`
            INSERT INTO users (id, name, email, password)
            VALUES (?, ?, ?, ?)
        `);

        try {
            stmt.run(id, body.name, body.email ?? null, passwordStored);
            reply.code(201).send({ id, name: body.name, email: body.email ?? null });
        } catch (error: any) {
            console.error('[auth] registerUser error:', error);
            if (error && error.code === 'SQLITE_CONSTRAINT') {
                reply.code(409).send({ error: 'User with this name or email already exists' });
                return;
            }
            reply.code(500).send({ error: 'Failed to register user' });
            return;
        }

        this.printDatabase();
    }

    printDatabase() {
        // this.sqlite.
    }

    async loginUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const body = request.body as LoginFormat;
        console.log('[auth] loginUser body:', JSON.stringify(body));

        if (!body || !body.name || !body.password) {
            reply.code(400).send({ error: 'Invalid login - name and password required' });
            return;
        }

        // Get user from database
        const stmt = this.sqlite.prepare(`
            SELECT id, name, email, password, created_at
            FROM users 
            WHERE name = ?
        `);

        try {
            const user = stmt.get(body.name) as any;
            
            if (!user) {
                console.log(`[auth] User not found: ${body.name}`);
                reply.code(401).send({ error: 'Invalid credentials' });
                return;
            }

            // Verify password
            const [salt, storedHash] = user.password.split(':');
            const derivedKey = crypto.scryptSync(body.password, salt, 64) as Buffer;
            const providedHash = derivedKey.toString('hex');

            if (providedHash !== storedHash) {
                console.log(`[auth] Password mismatch for user: ${body.name}`);
                reply.code(401).send({ error: 'Invalid credentials' });
                return;
            }

            // Successful login
            console.log(color.green(`[auth] Login successful for user: ${body.name}`));
            reply.code(200).send({ 
                id: user.id, 
                name: user.name, 
                email: user.email,
                message: 'Login successful'
            });

        } catch (error: any) {
            console.error('[auth] loginUser error:', error);
            reply.code(500).send({ error: 'Internal server error during login' });
            return;
        }
    }
};