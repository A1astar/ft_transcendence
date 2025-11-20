import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';

import crypto from 'crypto';
import color from 'chalk';

export interface Session {
    id: string,
    userId: string
}

export default class Database {
    private users: Map<string, User> = new Map();
    private usersByName: Map<string, User> = new Map();
    private sessions: Map<string, User> = new Map();

    printDatabase() {
        console.log(color.bold.cyan('\n=== Database Contents ==='));

        this.users.forEach((user, key) => {
            console.log(color.yellow(`ID: ${user.id}`));
            console.log(color.green(`Name: ${user.name}`));
            console.log(color.blue(`Email: ${user.email}`));
            console.log('---');
        });
    }

    createSession(userId: string) : Session {
        const sessionId = crypto.randomBytes(32).toString('hex');

        const session: Session = {
            userId: userId,
            id: sessionId
        };
        return session;
    }

    authenticateUser(req: AuthenticationFormat) : void {
        const user = this.users.get(req.name);
        if (!user) {
            console.log(color.red("can't find user in database"));
            throw new Error();
        }
    }

    registerUser(req: RegistrationFormat) : void {
        const user = new User(req);
        const session = this.createSession(user.id);

        this.users.set(user.id, user);
        this.sessions.set(session.id, user);
    }

    getUser(username: string) : User | undefined {
        return this.users.get(username);
   }

    deleteUser(req: AuthenticationFormat) {
        const user = this.users.get(req.name);

        if (!user)
            return;

        this.users.delete(user.name);
    }
}

export class SQLiteDatabase {
    private sqlite: BetterSQLite3Database;

    constructor() {
        this.sqlite = new BetterSQLite3("database.db", {
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
                name TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );


            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                expiresAt INTEGER NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
            CREATE INDEX IF NOT EXISTS idx_sessions_expiresAt ON sessions(expiresAt);
        `);
    }

    async registerAccount(request: FastifyRequest, reply: FastifyReply) : Promise<void> {

        console.log(color.bold.italic.yellow("\n----- REGISTER -----"));

        database.registerUser(request.body as RegistrationFormat);
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
        database.printDatabase();

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
