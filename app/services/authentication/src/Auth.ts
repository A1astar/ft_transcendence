// import BetterSqlite3, { Database as BetterSQLite3Database } from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import type { Database as BetterSQLite3Database } from 'better-sqlite3';
import Vault from "node-vault";

export class Auth {
    private database: BetterSQLite3Database;
    private vaultClient

    constructor () {
        database = new ();
        vaultClient = new Vault():
    }
};