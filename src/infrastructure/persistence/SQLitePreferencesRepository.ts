import * as SQLite from 'expo-sqlite';
import { PreferencesRepository } from '@/domain/repositories';
import {
  ReaderPreferences,
  AccountPreferences,
  DEFAULT_READER_PREFERENCES,
  DEFAULT_ACCOUNT_PREFERENCES,
} from '@/domain/models';
import { createDBAdapter, DBAdapter } from './dbAdapter';

/**
 * SQLite implementation of PreferencesRepository
 *
 * Persists user preferences to local SQLite database.
 * Uses key-value storage with JSON serialization.
 */
export class SQLitePreferencesRepository implements PreferencesRepository {
  private dbAdapter: DBAdapter;

  private static readonly READER_PREFS_KEY = 'reader_preferences';
  private static readonly ACCOUNT_PREFS_KEY = 'account_preferences';

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
  }

  /**
   * Get reader preferences
   */
  async getReaderPreferences(): Promise<ReaderPreferences> {
    try {
      const row = this.dbAdapter.getFirst<{ value: string }>(
        `SELECT value FROM preferences WHERE key = ?`,
        [SQLitePreferencesRepository.READER_PREFS_KEY]
      );

      if (!row) {
        return DEFAULT_READER_PREFERENCES;
      }

      return JSON.parse(row.value);
    } catch (error) {
      console.error('Error getting reader preferences:', error);
      return DEFAULT_READER_PREFERENCES;
    }
  }

  /**
   * Update reader preferences
   */
  async updateReaderPreferences(prefs: Partial<ReaderPreferences>): Promise<void> {
    try {
      const current = await this.getReaderPreferences();
      const updated = { ...current, ...prefs };
      const now = new Date().toISOString();

      this.dbAdapter.run(
        `INSERT OR REPLACE INTO preferences (key, value, updated_at)
         VALUES (?, ?, ?)`,
        [SQLitePreferencesRepository.READER_PREFS_KEY, JSON.stringify(updated), now]
      );
    } catch (error) {
      console.error('Error updating reader preferences:', error);
      throw new Error('Failed to update reader preferences');
    }
  }

  /**
   * Get account preferences
   */
  async getAccountPreferences(): Promise<AccountPreferences> {
    try {
      const row = this.dbAdapter.getFirst<{ value: string }>(
        `SELECT value FROM preferences WHERE key = ?`,
        [SQLitePreferencesRepository.ACCOUNT_PREFS_KEY]
      );

      if (!row) {
        return DEFAULT_ACCOUNT_PREFERENCES;
      }

      return JSON.parse(row.value);
    } catch (error) {
      console.error('Error getting account preferences:', error);
      return DEFAULT_ACCOUNT_PREFERENCES;
    }
  }

  /**
   * Update account preferences
   */
  async updateAccountPreferences(prefs: Partial<AccountPreferences>): Promise<void> {
    try {
      const current = await this.getAccountPreferences();
      const updated = { ...current, ...prefs };
      const now = new Date().toISOString();

      this.dbAdapter.run(
        `INSERT OR REPLACE INTO preferences (key, value, updated_at)
         VALUES (?, ?, ?)`,
        [SQLitePreferencesRepository.ACCOUNT_PREFS_KEY, JSON.stringify(updated), now]
      );
    } catch (error) {
      console.error('Error updating account preferences:', error);
      throw new Error('Failed to update account preferences');
    }
  }

  /**
   * Clear all preferences (for testing and data management)
   */
  async clearAllPreferences(): Promise<void> {
    try {
      this.dbAdapter.run(`DELETE FROM preferences`);
    } catch (error) {
      console.error('Error clearing preferences:', error);
      throw new Error('Failed to clear preferences');
    }
  }
}
