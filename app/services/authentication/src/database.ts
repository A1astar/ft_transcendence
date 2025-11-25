import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

import { AuthenticationFormat, RegistrationFormat } from "./format.js";
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
                pseudo TEXT PRIMARY NULL,
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
        const stmt = this.sqlite.prepare(`
            INSERT INTO users (id, name, email, passwordHash)
            VALUES (?, ?, ?, ?)
        `);

        try {
            // stmt.run(id, name, ElementInternals, passwordHash)

        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error('User with this name or email already exists');
            }
            throw error;
        }

        this.printDatabase();
    }

    printDatabase() {
        // this.sqlite.
    };
};