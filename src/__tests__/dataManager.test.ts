/**
 * Tests for LocalDataManager
 *
 * Verifies export and deletion functionality
 */

import { LocalDataManager } from '@/infrastructure/persistence/LocalDataManager';

describe('LocalDataManager', () => {
  let db: any;
  let manager: LocalDataManager;

  beforeEach(() => {
    db = {
      getFirstSync: jest.fn(),
      getAllSync: jest.fn(),
      runSync: jest.fn(),
      execSync: jest.fn(),
    };
    manager = new LocalDataManager(db);
  });

  describe('getDataStats', () => {
    it('returns counts for all data types', async () => {
      db.getFirstSync
        .mockReturnValueOnce({ count: 5 }) // bookmarks
        .mockReturnValueOnce({ count: 3 }) // highlights
        .mockReturnValueOnce({ count: 10 }) // notes
        .mockReturnValueOnce({ count: 2 }) // threads
        .mockReturnValueOnce({ count: 7 }); // sessions

      const stats = await manager.getDataStats();

      expect(stats).toEqual({
        bookmarks: 5,
        highlights: 3,
        notes: 10,
        guideThreads: 2,
        dailySessions: 7,
      });
    });

    it('handles empty database', async () => {
      db.getFirstSync.mockReturnValue({ count: 0 });

      const stats = await manager.getDataStats();

      expect(stats).toEqual({
        bookmarks: 0,
        highlights: 0,
        notes: 0,
        guideThreads: 0,
        dailySessions: 0,
      });
    });
  });

  describe('exportData', () => {
    it('exports all user data as JSON', async () => {
      db.getAllSync
        .mockReturnValueOnce([{ key: 'theme', value: 'dark' }]) // preferences
        .mockReturnValueOnce([{ id: 'b1', book: 'John', chapter: 3, verse: 16 }]) // bookmarks
        .mockReturnValueOnce([{ id: 'h1', book: 'John', chapter: 3, verse: 16, color: 'yellow' }]) // highlights
        .mockReturnValueOnce([{ id: 'n1', kind: 'reflection', content: 'My note' }]) // notes
        .mockReturnValueOnce([{ id: 't1', book: 'John', chapter: 3 }]); // threads (parent call)

      db.getAllSync
        .mockReturnValueOnce([]) // turns for thread
        .mockReturnValueOnce([{ id: 's1', date: '2026-08-31' }]); // sessions (parent call)

      db.getAllSync.mockReturnValue([]); // modules for session

      const result = await manager.exportData();
      const data = JSON.parse(result);

      expect(data).toHaveProperty('exportedAt');
      expect(data).toHaveProperty('version', 1);
      expect(data).toHaveProperty('preferences');
      expect(data).toHaveProperty('bookmarks');
      expect(data).toHaveProperty('highlights');
      expect(data).toHaveProperty('notes');
      expect(data).toHaveProperty('guideThreads');
      expect(data).toHaveProperty('dailySessions');
    });
  });

  describe('deleteAllData', () => {
    it('executes clear SQL statements', async () => {
      await manager.deleteAllData();

      expect(db.execSync).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM'));
    });

    it('does not delete schema', async () => {
      await manager.deleteAllData();

      const sql = db.execSync.mock.calls[0][0];
      expect(sql).not.toContain('DROP TABLE');
      expect(sql).not.toContain('schema_version');
    });
  });
});
