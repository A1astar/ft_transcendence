import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { UserFormat } from "./format.js";

import crypto from 'crypto';
import color from 'chalk';

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
        console.log('');
        const stmt = sqlite.prepare(`
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

        reply.setCookie(
            'sessionId', 'sessionTest', {
            // Security attributes
            httpOnly: true,              // Prevents JavaScript access (XSS protection)
            secure: true,                // Only sent over HTTPS
            sameSite: 'strict',          // CSRF protection: 'strict' | 'lax' | 'none'

            // Expiration attributes
            maxAge: 3600,                // Max age in seconds
            expires: new Date(),         // Absolute expiration date

            // Scope attributes
            domain: 'example.com',       // Domain the cookie is valid for
            path: '/',                   // URL path the cookie is valid for

            // Modern attributes
            partitioned: true,           // CHIPS - partitioned cookies
            priority: 'high',            // Cookie priority: 'low' | 'medium' | 'high'

            // Encoding
            encode: encodeURIComponent,  // Custom encoding function

            // Signing (if fastify-cookie is configured with secret)
            signed: true                 // Creates signed cookie for tamper protection
        });
    }

    printDatabase() {
        this.sqlite.
    };
};

/* SQLite database

// Database Connection
db.close()
db.pragma(string, options?)
db.checkpoint(databaseName?)
db.function(name, options?, function)
db.aggregate(name, options)
db.table(name, definition)
db.loadExtension(path)
db.backup(destination, options?)
db.serialize(options?)
db.defaultSafeIntegers(toggle?)
db.unsafeMode(unsafe?)

// Query Execution
db.exec(sql)                                    // Execute SQL without return
db.prepare(sql)                                 // Returns statement object

// Prepared Statements
stmt.run([...bindParameters])                   // Execute, returns info object
stmt.get([...bindParameters])                   // Returns first row or undefined
stmt.all([...bindParameters])                   // Returns array of all rows
stmt.iterate([...bindParameters])               // Returns iterator
stmt.pluck(toggleState?)                        // Returns only first column
stmt.expand(toggleState?)                       // Returns objects with column names
stmt.raw(toggleState?)                          // Returns arrays instead of objects
stmt.columns()                                  // Returns column information
stmt.bind([...bindParameters])                  // Bind parameters permanently
stmt.safeIntegers(toggleState?)                 // Handle large integers safely

// Transactions
db.transaction(function)                        // Returns transaction function
transaction.default()                           // Set as default mode
transaction.deferred()                          // Deferred transaction
transaction.immediate()                         // Immediate transaction
transaction.exclusive()                         // Exclusive transaction

// Database Information
db.memory                                       // Boolean - in-memory database
db.readonly                                     // Boolean - read-only mode
db.name                                         // Database file path
db.open                                         // Boolean - connection open
db.inTransaction                                // Boolean - in transaction

// Statement Information
stmt.reader                                     // Boolean - is SELECT statement
stmt.readonly                                   // Boolean - read-only statement
stmt.source                                     // Original SQL source
*/
