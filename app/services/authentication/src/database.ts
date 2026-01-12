import crypto from "crypto";
import BetterSQLite3, {
  Database as BetterSQLite3Database,
} from "better-sqlite3";

export class SQLiteDatabase {
  private sqlite: BetterSQLite3Database;

  constructor() {
    this.sqlite = new BetterSQLite3("database/user-management.db", {
      readonly: false,
      fileMustExist: false,
      timeout: 5000,
      verbose: undefined,
      nativeBinding: undefined,
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

    // Best-effort 2FA columns
    try {
      this.sqlite.exec(`
        ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0;
      `);
    } catch {}
    try {
      this.sqlite.exec(`
        ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
      `);
    } catch {}
  }

  // Look up a user by email (case-insensitive)
  findUserByEmail(email: string): any | null {
    const stmt = this.sqlite.prepare(`
      SELECT id, name, email,
             COALESCE(two_factor_enabled, 0) AS two_factor_enabled
      FROM users
      WHERE lower(email) = lower(?)
    `);
    return stmt.get(email) as any;
  }

  // Look up a user by username (case-insensitive)
  findUserByName(name: string): any | null {
    const stmt = this.sqlite.prepare(`
      SELECT id, name, email,
             COALESCE(two_factor_enabled, 0) AS two_factor_enabled
      FROM users
      WHERE lower(name) = lower(?)
    `);
    return stmt.get(name) as any;
  }

  // Look up a user by id
  findUserById(id: string): any | null {
    const stmt = this.sqlite.prepare(`
      SELECT id, name, email,
             COALESCE(two_factor_enabled, 0) AS two_factor_enabled
      FROM users
      WHERE id = ?
    `);
    return stmt.get(id) as any;
  }

  // Insert a user with a placeholder password to satisfy NOT NULL
  insertUser(opts: { email: string; name: string; passwordPlaceholder: string }): string {
    const id = crypto.randomUUID();
    const stmt = this.sqlite.prepare(`
      INSERT INTO users (id, name, email, password, two_factor_enabled, two_factor_secret)
      VALUES (?, ?, ?, ?, 0, NULL)
    `);
    stmt.run(id, opts.name, opts.email, opts.passwordPlaceholder);
    return id;
  }

  // Update supported fields (currently 2FA flag)
  updateUser(id: string, fields: { twoFactorEnabled?: number }): void {
    if (typeof fields.twoFactorEnabled === "number") {
      const stmt = this.sqlite.prepare(`
        UPDATE users
        SET two_factor_enabled = ?
        WHERE id = ?
      `);
      stmt.run(fields.twoFactorEnabled, id);
    }
  }
}
