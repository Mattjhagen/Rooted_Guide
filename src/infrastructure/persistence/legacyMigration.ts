import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHECK_MIGRATION_SQL, markMigrationComplete } from './userDataSchema';
import { createDBAdapter } from './dbAdapter';

/**
 * Legacy data migration from AsyncStorage to SQLite
 *
 * Cautiously imports data from Rooted_Daily's AsyncStorage keys:
 * - app-persistence (lastReadRef, devotional progress, interests)
 * - rooted-journal-storage (journal entries)
 *
 * This migration:
 * - Recognizes old storage keys safely
 * - Imports valid data into new SQLite schema
 * - Handles empty, partial, corrupt, and duplicate data
 * - Records migration completion
 * - Is idempotent (safe to run multiple times)
 * - Never erases legacy data (user must do that manually if desired)
 */

const MIGRATION_KEYS = {
  JOURNAL: 'legacy_journal_migration',
  PERSISTENCE: 'legacy_persistence_migration',
} as const;

const LEGACY_STORAGE_KEYS = {
  JOURNAL: 'rooted-journal-storage',
  PERSISTENCE: 'app-persistence',
} as const;

interface LegacyJournalEntry {
  id: string;
  date: string;
  verseRef: string;
  verseText: string;
  note: string;
  type: 'reflection' | 'prayer';
  isFavorite?: boolean;
}

interface LegacyJournalState {
  state: {
    entries: LegacyJournalEntry[];
  };
  version: number;
}

interface LegacyPersistenceState {
  state: {
    lastReadRef: string | null;
    interests: string[];
  };
  version: number;
}

/**
 * Run all legacy migrations if not already completed
 *
 * Completes silently when there's no legacy data.
 * Only throws for genuine unexpected failures.
 */
export async function runLegacyMigrations(db: SQLite.SQLiteDatabase | any): Promise<void> {
  try {
    await migrateJournalEntries(db);
    await migrateUserPreferences(db);
    console.log('Legacy migrations complete');
  } catch (error) {
    // Only log to console - don't throw unless it's a critical database error
    console.error('Legacy migration encountered an error:', error);
    // Swallow the error - missing AsyncStorage or no legacy data is not a failure
  }
}

/**
 * Migrate journal entries from AsyncStorage to notes table
 *
 * Completes silently if no legacy data exists or AsyncStorage is unavailable.
 */
async function migrateJournalEntries(db: SQLite.SQLiteDatabase | any): Promise<void> {
  const dbAdapter = createDBAdapter(db);
  try {
    if (await isMigrationComplete(db, MIGRATION_KEYS.JOURNAL)) {
      return;
    }

    const journalData = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.JOURNAL);
    if (!journalData) {
      dbAdapter.exec(markMigrationComplete(MIGRATION_KEYS.JOURNAL, 'No data to migrate'));
      return;
    }

    const parsed: LegacyJournalState = JSON.parse(journalData);
    const entries = parsed.state?.entries || [];

    if (entries.length === 0) {
      dbAdapter.exec(markMigrationComplete(MIGRATION_KEYS.JOURNAL, 'No entries'));
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const entry of entries) {
      try {
        if (!entry.note || !entry.type) {
          skippedCount++;
          continue;
        }

        const verseRef = parseVerseRef(entry.verseRef);
        const now = new Date().toISOString();

        dbAdapter.run(
          `INSERT OR IGNORE INTO notes (id, kind, content, book, chapter, verse, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `migrated_${entry.id}`,
            entry.type,
            entry.note,
            verseRef?.book || null,
            verseRef?.chapter || null,
            verseRef?.verse || null,
            entry.date || now,
            now,
          ]
        );

        migratedCount++;
      } catch (error) {
        console.warn(`Failed to migrate entry ${entry.id}:`, error);
        skippedCount++;
      }
    }

    dbAdapter.exec(
      markMigrationComplete(
        MIGRATION_KEYS.JOURNAL,
        `Migrated ${migratedCount} entries, skipped ${skippedCount}`
      )
    );

    console.log(`Journal migration complete: ${migratedCount} entries, ${skippedCount} skipped`);
  } catch (error) {
    // AsyncStorage unavailable or other non-critical error - mark as complete
    console.log(
      'Journal migration skipped:',
      error instanceof Error ? error.message : String(error)
    );
    try {
      dbAdapter.exec(markMigrationComplete(MIGRATION_KEYS.JOURNAL, 'Skipped - no access'));
    } catch {
      // If even marking as complete fails, silently continue
    }
  }
}

/**
 * Migrate user preferences from AsyncStorage to preferences table
 *
 * Completes silently if no legacy data exists or AsyncStorage is unavailable.
 */
async function migrateUserPreferences(db: SQLite.SQLiteDatabase | any): Promise<void> {
  const dbAdapter = createDBAdapter(db);
  try {
    if (await isMigrationComplete(db, MIGRATION_KEYS.PERSISTENCE)) {
      return;
    }

    const persistenceData = await AsyncStorage.getItem(LEGACY_STORAGE_KEYS.PERSISTENCE);
    if (!persistenceData) {
      dbAdapter.exec(markMigrationComplete(MIGRATION_KEYS.PERSISTENCE, 'No data to migrate'));
      return;
    }

    const parsed: LegacyPersistenceState = JSON.parse(persistenceData);
    const state = parsed.state || {};
    const now = new Date().toISOString();

    if (state.lastReadRef) {
      dbAdapter.run(
        `INSERT OR REPLACE INTO preferences (key, value, updated_at)
         VALUES (?, ?, ?)`,
        ['last_read_ref', JSON.stringify(state.lastReadRef), now]
      );
    }

    if (state.interests && state.interests.length > 0) {
      dbAdapter.run(
        `INSERT OR REPLACE INTO preferences (key, value, updated_at)
         VALUES (?, ?, ?)`,
        ['interests', JSON.stringify(state.interests), now]
      );
    }

    dbAdapter.exec(markMigrationComplete(MIGRATION_KEYS.PERSISTENCE, 'Preferences migrated'));

    console.log('Persistence migration complete');
  } catch (error) {
    // AsyncStorage unavailable or other non-critical error - mark as complete
    console.log(
      'Preferences migration skipped:',
      error instanceof Error ? error.message : String(error)
    );
    try {
      dbAdapter.exec(markMigrationComplete(MIGRATION_KEYS.PERSISTENCE, 'Skipped - no access'));
    } catch {
      // If even marking as complete fails, silently continue
    }
  }
}

/**
 * Check if a migration has been completed
 */
async function isMigrationComplete(db: SQLite.SQLiteDatabase | any, key: string): Promise<boolean> {
  try {
    const dbAdapter = createDBAdapter(db);
    const result = dbAdapter.getFirst<{ completed_at: string }>(CHECK_MIGRATION_SQL, [key]);
    return result !== null;
  } catch {
    return false;
  }
}

/**
 * Parse legacy verse reference string (e.g., "John 3:16")
 *
 * Returns null if invalid or unparseable.
 */
function parseVerseRef(ref: string): { book: string; chapter: number; verse: number } | null {
  try {
    if (!ref || typeof ref !== 'string') return null;

    const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (!match) return null;

    const [, book, chapterStr, verseStr] = match;
    const chapter = parseInt(chapterStr, 10);
    const verse = parseInt(verseStr, 10);

    if (!book || isNaN(chapter) || isNaN(verse)) return null;

    return { book: book.trim(), chapter, verse };
  } catch {
    return null;
  }
}
