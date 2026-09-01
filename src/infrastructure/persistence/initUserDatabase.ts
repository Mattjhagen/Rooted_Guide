import * as SQLite from 'expo-sqlite';
import {
  USER_DATA_SCHEMA_INIT_SQL,
  USER_DATA_SCHEMA_VERSION,
  insertSchemaVersion,
} from './userDataSchema';
import { createDBAdapter } from './dbAdapter';

/**
 * Initialize user data database
 *
 * Creates schema if it doesn't exist and handles migrations.
 * Safe to call on every app launch (idempotent).
 *
 * @param db SQLite database instance
 */
export function initUserDatabase(db: SQLite.SQLiteDatabase | any): void {
  try {
    const dbAdapter = createDBAdapter(db);
    dbAdapter.exec(USER_DATA_SCHEMA_INIT_SQL);

    const currentVersion = getCurrentSchemaVersion(db);

    if (currentVersion === null || currentVersion < USER_DATA_SCHEMA_VERSION) {
      runMigrations(db, currentVersion || 0, USER_DATA_SCHEMA_VERSION);
      dbAdapter.exec(insertSchemaVersion(USER_DATA_SCHEMA_VERSION));
    }

    console.log(`User database initialized (schema version ${USER_DATA_SCHEMA_VERSION})`);
  } catch (error) {
    console.error('Failed to initialize user database:', error);
    throw error;
  }
}

/**
 * Get current schema version from database
 */
function getCurrentSchemaVersion(db: SQLite.SQLiteDatabase | any): number | null {
  try {
    const dbAdapter = createDBAdapter(db);
    const result = dbAdapter.getFirst<{ version: number }>(
      `SELECT version FROM schema_version ORDER BY version DESC LIMIT 1`
    );
    return result?.version || null;
  } catch {
    return null;
  }
}

/**
 * Run migrations from one version to another
 *
 * Migrations are idempotent and atomic where possible.
 * Future schema changes should add migration steps here.
 */
function runMigrations(
  db: SQLite.SQLiteDatabase | any,
  fromVersion: number,
  toVersion: number
): void {
  console.log(`Running migrations from version ${fromVersion} to ${toVersion}`);

  if (fromVersion < 1 && toVersion >= 1) {
    console.log('Schema version 1: Initial schema created');
  }

  if (fromVersion < 2 && toVersion >= 2) {
    console.log('Schema version 2: Add next_devotional_available_at to daily_sessions');
    const dbAdapter = createDBAdapter(db);
    try {
      dbAdapter.exec(`ALTER TABLE daily_sessions ADD COLUMN next_devotional_available_at TEXT;`);
      console.log('Migration to version 2 complete');
    } catch {
      console.log('Column may already exist, continuing...');
    }
  }

  console.log('Migrations complete');
}

/**
 * Verify database integrity
 *
 * Checks that all expected tables exist and are accessible.
 * Useful for diagnosing initialization issues.
 */
export function verifyUserDatabase(db: SQLite.SQLiteDatabase | any): boolean {
  try {
    const dbAdapter = createDBAdapter(db);
    const tables = [
      'schema_version',
      'preferences',
      'daily_sessions',
      'daily_modules',
      'reflections',
      'bookmarks',
      'highlights',
      'notes',
      'guide_threads',
      'guide_turns',
      'guide_citations',
      'guide_suggestions',
      'migration_status',
    ];

    for (const table of tables) {
      const result = dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?`,
        [table]
      );

      if (!result || result.count === 0) {
        console.error(`Table ${table} not found`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Database verification failed:', error);
    return false;
  }
}
