import { User, generateId } from "./user.js"
import { UserFormat } from "./format.js";

export default class Database {
    private users: Map<string, User> = new Map();

    // getUser(username: string) : User {
    //     return this.users.get(username);
    // }

    async authenticateUser(req: UserFormat) : Promise<boolean> {
        const user = this.users.get(req.name);

        if (!user)
            return false;
        // should decode / decrypt first
        if (user.password == req.password)
            return false;
        return true;
    }

    addUser(req: UserFormat) {
        let user = new User(req.name, req.password);

        this.users.set(user.name, user);
    }

    deleteUser(req: UserFormat) {
        const user = this.users.get(req.name);

        if (!user)
            return;

        this.users.delete(user.name);
    }
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
