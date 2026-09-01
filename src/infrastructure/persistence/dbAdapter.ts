/**
 * Database Adapter
 *
 * Provides a consistent API across better-sqlite3 (tests) and expo-sqlite (runtime).
 * Handles differences in method names and parameter passing.
 */

export interface DBAdapter {
  exec(sql: string): void;
  run(sql: string, params?: any[]): void;
  getFirst<T>(sql: string, params?: any[]): T | null;
  getAll<T>(sql: string, params?: any[]): T[];
}

export function createDBAdapter(db: any): DBAdapter {
  const isBetterSQLite = !!db.prepare;
  const isExpoSQLite = !!db.execSync;

  return {
    exec(sql: string): void {
      if (isExpoSQLite) {
        db.execSync(sql);
      } else if (isBetterSQLite) {
        db.exec(sql);
      } else {
        throw new Error('Unsupported database type');
      }
    },

    run(sql: string, params?: any[]): void {
      if (isExpoSQLite) {
        db.runSync(sql, params || []);
      } else if (isBetterSQLite) {
        db.prepare(sql).run(...(params || []));
      } else {
        throw new Error('Unsupported database type');
      }
    },

    getFirst<T>(sql: string, params?: any[]): T | null {
      if (isExpoSQLite) {
        const result = db.getFirstSync(sql, params || []);
        return (result as T) || null;
      } else if (isBetterSQLite) {
        const result = db.prepare(sql).get(...(params || []));
        return (result as T) || null;
      } else {
        throw new Error('Unsupported database type');
      }
    },

    getAll<T>(sql: string, params?: any[]): T[] {
      if (isExpoSQLite) {
        const results = db.getAllSync(sql, params || []);
        return results as T[];
      } else if (isBetterSQLite) {
        const results = db.prepare(sql).all(...(params || []));
        return results as T[];
      } else {
        throw new Error('Unsupported database type');
      }
    },
  };
}
