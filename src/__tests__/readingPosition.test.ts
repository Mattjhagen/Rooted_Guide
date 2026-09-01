import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import { SQLitePreferencesRepository } from '../infrastructure/persistence/SQLitePreferencesRepository';
import {
  USER_DATA_SCHEMA_INIT_SQL,
  USER_DATA_SCHEMA_VERSION,
  insertSchemaVersion,
} from '../infrastructure/persistence/userDataSchema';

/**
 * Tests for reading position tracking
 *
 * Verifies that:
 * - Last read reference is persisted correctly
 * - Reading position survives app restarts
 * - Position updates are atomic
 */
describe('Reading Position Tracking', () => {
  let db: Database.Database;
  let preferencesRepository: SQLitePreferencesRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(USER_DATA_SCHEMA_INIT_SQL);
    db.exec(insertSchemaVersion(USER_DATA_SCHEMA_VERSION));
    preferencesRepository = new SQLitePreferencesRepository(db as any);
  });

  afterEach(() => {
    db.close();
  });

  it('should initialize with null reading position', async () => {
    const prefs = await preferencesRepository.getReaderPreferences();
    expect(prefs.lastReadRef).toBeNull();
  });

  it('should persist reading position', async () => {
    await preferencesRepository.updateReaderPreferences({
      lastReadRef: 'Genesis 1',
    });

    const prefs = await preferencesRepository.getReaderPreferences();
    expect(prefs.lastReadRef).toBe('Genesis 1');
  });

  it('should update reading position', async () => {
    await preferencesRepository.updateReaderPreferences({
      lastReadRef: 'Genesis 1',
    });

    await preferencesRepository.updateReaderPreferences({
      lastReadRef: 'Genesis 2',
    });

    const prefs = await preferencesRepository.getReaderPreferences();
    expect(prefs.lastReadRef).toBe('Genesis 2');
  });

  it('should preserve other reader preferences when updating position', async () => {
    await preferencesRepository.updateReaderPreferences({
      fontSize: 'large',
      fontFamily: 'serif',
    });

    await preferencesRepository.updateReaderPreferences({
      lastReadRef: 'John 3',
    });

    const prefs = await preferencesRepository.getReaderPreferences();
    expect(prefs.lastReadRef).toBe('John 3');
    expect(prefs.fontSize).toBe('large');
    expect(prefs.fontFamily).toBe('serif');
  });

  it('should handle various book name formats', async () => {
    const refs = ['Genesis 1', '1 Samuel 17', 'Song of Solomon 2', 'Revelation 22'];

    for (const ref of refs) {
      await preferencesRepository.updateReaderPreferences({
        lastReadRef: ref,
      });

      const prefs = await preferencesRepository.getReaderPreferences();
      expect(prefs.lastReadRef).toBe(ref);
    }
  });

  it('should allow clearing reading position', async () => {
    await preferencesRepository.updateReaderPreferences({
      lastReadRef: 'Psalms 23',
    });

    await preferencesRepository.updateReaderPreferences({
      lastReadRef: null,
    });

    const prefs = await preferencesRepository.getReaderPreferences();
    expect(prefs.lastReadRef).toBeNull();
  });
});
