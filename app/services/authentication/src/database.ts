import BetterSQLite3, { Database as BetterSQLite3Database } from "better-sqlite3";
import { User, generateId } from "./user.js";
import { UserFormat } from "./format.js";
import color from 'chalk';

export default class Database {
    private users: Map<string, User> = new Map();
    private sessions: Map<string, User> = new Map();

    authenticateUser(req: UserFormat) : void {
        const user = this.users.get(req.name);
        if (!user) {
            console.log(color.red("Can't find user in database"));
            throw new Error();

        }
    }

    registerUser(req: UserFormat) : void {

    }

    getUser(username: string) : User | undefined {
        return this.users.get(username);
    }

    deleteUser(req: UserFormat) {
        const user = this.users.get(req.name);

        if (!user)
            return;

        this.users.delete(user.name);
    }
}

export function initSQLite3Database(database: BetterSQLite3Database) : BetterSQLite3Database {
    database = new BetterSQLite3("database.db", {
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

    database.exec(`
            CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );

        CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    return database;
}

/*
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
