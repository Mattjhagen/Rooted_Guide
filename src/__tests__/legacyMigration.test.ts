/**
 * Legacy Migration Tests
 *
 * Tests for migrating data from AsyncStorage to SQLite:
 * - Journal entries migration
 * - User preferences migration
 * - Idempotent behavior
 * - Handling corrupt/partial data
 */

import Database from 'better-sqlite3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { runLegacyMigrations } from '@/infrastructure/persistence/legacyMigration';
import { initUserDatabase } from '@/infrastructure/persistence';

jest.mock('@react-native-async-storage/async-storage');

describe('Legacy Migration', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initUserDatabase(db as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    db.close();
  });

  describe('journal entries migration', () => {
    it('should migrate valid journal entries', async () => {
      const legacyData = {
        state: {
          entries: [
            {
              id: 'entry1',
              date: '2026-08-30T10:00:00.000Z',
              verseRef: 'John 3:16',
              verseText: 'For God so loved...',
              note: 'This verse means so much to me',
              type: 'reflection',
            },
            {
              id: 'entry2',
              date: '2026-08-31T10:00:00.000Z',
              verseRef: 'Psalms 23:1',
              verseText: 'The Lord is my shepherd...',
              note: 'Lord, thank you for being my shepherd',
              type: 'prayer',
            },
          ],
        },
        version: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'rooted-journal-storage') {
          return JSON.stringify(legacyData);
        }
        return null;
      });

      await runLegacyMigrations(db as any);

      const notes = db.prepare('SELECT * FROM notes WHERE deleted_at IS NULL').all() as {
        id: string;
        kind: string;
        content: string;
        book: string;
        chapter: number;
        verse: number;
      }[];

      expect(notes).toHaveLength(2);
      expect(notes[0].kind).toBe('reflection');
      expect(notes[0].content).toBe('This verse means so much to me');
      expect(notes[0].book).toBe('John');
      expect(notes[0].chapter).toBe(3);
      expect(notes[0].verse).toBe(16);
    });

    it('should handle entries without verse references', async () => {
      const legacyData = {
        state: {
          entries: [
            {
              id: 'entry1',
              date: '2026-08-30T10:00:00.000Z',
              verseRef: '',
              verseText: '',
              note: 'General prayer',
              type: 'prayer',
            },
          ],
        },
        version: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'rooted-journal-storage') {
          return JSON.stringify(legacyData);
        }
        return null;
      });

      await runLegacyMigrations(db as any);

      const notes = db.prepare('SELECT * FROM notes WHERE deleted_at IS NULL').all() as {
        id: string;
        book: string | null;
      }[];

      expect(notes).toHaveLength(1);
      expect(notes[0].book).toBeNull();
    });

    it('should skip entries with invalid data', async () => {
      const legacyData = {
        state: {
          entries: [
            {
              id: 'entry1',
              date: '2026-08-30T10:00:00.000Z',
              verseRef: 'John 3:16',
              verseText: 'For God so loved...',
              note: '',
              type: 'reflection',
            },
            {
              id: 'entry2',
              date: '2026-08-31T10:00:00.000Z',
              verseRef: 'Psalms 23:1',
              verseText: 'The Lord is my shepherd...',
              note: 'Valid note',
              type: 'prayer',
            },
          ],
        },
        version: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'rooted-journal-storage') {
          return JSON.stringify(legacyData);
        }
        return null;
      });

      await runLegacyMigrations(db as any);

      const notes = db.prepare('SELECT * FROM notes WHERE deleted_at IS NULL').all();

      expect(notes).toHaveLength(1);
    });

    it('should be idempotent', async () => {
      const legacyData = {
        state: {
          entries: [
            {
              id: 'entry1',
              date: '2026-08-30T10:00:00.000Z',
              verseRef: 'John 3:16',
              verseText: 'For God so loved...',
              note: 'Test note',
              type: 'reflection',
            },
          ],
        },
        version: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'rooted-journal-storage') {
          return JSON.stringify(legacyData);
        }
        return null;
      });

      await runLegacyMigrations(db as any);
      await runLegacyMigrations(db as any);
      await runLegacyMigrations(db as any);

      const notes = db.prepare('SELECT * FROM notes WHERE deleted_at IS NULL').all();

      expect(notes).toHaveLength(1);
    });

    it('should handle empty journal data', async () => {
      const legacyData = {
        state: {
          entries: [],
        },
        version: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'rooted-journal-storage') {
          return JSON.stringify(legacyData);
        }
        return null;
      });

      await runLegacyMigrations(db as any);

      const migration = db
        .prepare('SELECT * FROM migration_status WHERE key = ?')
        .get('legacy_journal_migration') as { completed_at: string };

      expect(migration).toBeTruthy();
    });

    it('should handle missing journal data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await runLegacyMigrations(db as any);

      const migration = db
        .prepare('SELECT * FROM migration_status WHERE key = ?')
        .get('legacy_journal_migration') as { completed_at: string };

      expect(migration).toBeTruthy();
    });
  });

  describe('preferences migration', () => {
    it('should migrate user preferences', async () => {
      const legacyData = {
        state: {
          lastReadRef: 'John 3:16',
          interests: ['prayer', 'study', 'worship'],
        },
        version: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'app-persistence') {
          return JSON.stringify(legacyData);
        }
        return null;
      });

      await runLegacyMigrations(db as any);

      const lastReadRef = db
        .prepare('SELECT value FROM preferences WHERE key = ?')
        .get('last_read_ref') as { value: string };

      expect(JSON.parse(lastReadRef.value)).toBe('John 3:16');

      const interests = db
        .prepare('SELECT value FROM preferences WHERE key = ?')
        .get('interests') as {
        value: string;
      };

      expect(JSON.parse(interests.value)).toEqual(['prayer', 'study', 'worship']);
    });

    it('should handle missing preferences', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await runLegacyMigrations(db as any);

      const migration = db
        .prepare('SELECT * FROM migration_status WHERE key = ?')
        .get('legacy_persistence_migration') as { completed_at: string };

      expect(migration).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle corrupt JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json{');

      await expect(runLegacyMigrations(db as any)).resolves.not.toThrow();
    });

    it('should continue on individual entry failure', async () => {
      const legacyData = {
        state: {
          entries: [
            {
              id: 'entry1',
              type: 'reflection',
            },
            {
              id: 'entry2',
              date: '2026-08-31T10:00:00.000Z',
              verseRef: 'John 3:16',
              verseText: 'For God so loved...',
              note: 'Valid note',
              type: 'prayer',
            },
          ],
        },
        version: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
        if (key === 'rooted-journal-storage') {
          return JSON.stringify(legacyData);
        }
        return null;
      });

      await runLegacyMigrations(db as any);

      const notes = db.prepare('SELECT * FROM notes WHERE deleted_at IS NULL').all();

      expect(notes).toHaveLength(1);
    });
  });
});
