/**
 * LocalDataManager Tests
 *
 * Tests for data management utilities:
 * - Get data statistics
 * - Export all data as JSON
 * - Delete all user data
 */

import Database from 'better-sqlite3';
import { LocalDataManager } from '@/infrastructure/persistence';
import {
  SQLiteBookmarkRepository,
  SQLiteNotesRepository,
  SQLiteDailyPracticeRepository,
} from '@/infrastructure/persistence';
import { initUserDatabase } from '@/infrastructure/persistence';
import { NoteKind } from '@/domain/models';

describe('LocalDataManager', () => {
  let db: Database.Database;
  let dataManager: LocalDataManager;

  beforeEach(() => {
    db = new Database(':memory:');
    initUserDatabase(db as any);
    dataManager = new LocalDataManager(db as any);
  });

  afterEach(() => {
    db.close();
  });

  describe('getDataStats', () => {
    it('should return zero stats for empty database', async () => {
      const stats = await dataManager.getDataStats();

      expect(stats).toEqual({
        bookmarks: 0,
        highlights: 0,
        notes: 0,
        guideThreads: 0,
        dailySessions: 0,
      });
    });

    it('should count bookmarks', async () => {
      const bookmarkRepo = new SQLiteBookmarkRepository(db as any);
      await bookmarkRepo.addBookmark({ book: 'John', chapter: 3, verse: 16 });
      await bookmarkRepo.addBookmark({ book: 'Genesis', chapter: 1, verse: 1 });

      const stats = await dataManager.getDataStats();

      expect(stats.bookmarks).toBe(2);
    });

    it('should count notes (excluding deleted)', async () => {
      const notesRepo = new SQLiteNotesRepository(db as any);
      const note1 = await notesRepo.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 1',
      });
      await notesRepo.createNote({
        kind: NoteKind.Prayer,
        content: 'Note 2',
      });
      await notesRepo.deleteNote(note1.id);

      const stats = await dataManager.getDataStats();

      expect(stats.notes).toBe(1);
    });

    it('should count daily sessions', async () => {
      const sessionRepo = new SQLiteDailyPracticeRepository(db as any);
      await sessionRepo.createSession('2026-08-30');
      await sessionRepo.createSession('2026-08-31');

      const stats = await dataManager.getDataStats();

      expect(stats.dailySessions).toBe(2);
    });
  });

  describe('exportData', () => {
    it('should export empty data', async () => {
      const json = await dataManager.exportData();
      const data = JSON.parse(json);

      expect(data.version).toBe(1);
      expect(data.exportedAt).toBeTruthy();
      expect(data.bookmarks).toEqual([]);
      expect(data.notes).toEqual([]);
    });

    it('should export bookmarks', async () => {
      const bookmarkRepo = new SQLiteBookmarkRepository(db as any);
      await bookmarkRepo.addBookmark({ book: 'John', chapter: 3, verse: 16 });

      const json = await dataManager.exportData();
      const data = JSON.parse(json);

      expect(data.bookmarks).toHaveLength(1);
      expect(data.bookmarks[0].book).toBe('John');
      expect(data.bookmarks[0].chapter).toBe(3);
      expect(data.bookmarks[0].verse).toBe(16);
    });

    it('should export notes without deleted ones', async () => {
      const notesRepo = new SQLiteNotesRepository(db as any);
      const note1 = await notesRepo.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 1',
      });
      await notesRepo.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 2',
      });
      await notesRepo.deleteNote(note1.id);

      const json = await dataManager.exportData();
      const data = JSON.parse(json);

      expect(data.notes).toHaveLength(1);
      expect(data.notes[0].content).toBe('Note 2');
    });

    it('should export daily sessions with modules', async () => {
      const sessionRepo = new SQLiteDailyPracticeRepository(db as any);
      const session = await sessionRepo.createSession('2026-08-31');
      await sessionRepo.completeModule(session.id, 'arrive');
      await sessionRepo.completeModule(session.id, 'read');

      const json = await dataManager.exportData();
      const data = JSON.parse(json);

      expect(data.dailySessions).toHaveLength(1);
      expect(data.dailySessions[0].modules).toHaveLength(2);
    });

    it('should be valid JSON', async () => {
      const bookmarkRepo = new SQLiteBookmarkRepository(db as any);
      await bookmarkRepo.addBookmark({ book: 'John', chapter: 3, verse: 16 });

      const json = await dataManager.exportData();

      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('deleteAllData', () => {
    it('should delete all bookmarks', async () => {
      const bookmarkRepo = new SQLiteBookmarkRepository(db as any);
      await bookmarkRepo.addBookmark({ book: 'John', chapter: 3, verse: 16 });
      await bookmarkRepo.addBookmark({ book: 'Genesis', chapter: 1, verse: 1 });

      await dataManager.deleteAllData();

      const bookmarks = await bookmarkRepo.getAllBookmarks();
      expect(bookmarks).toHaveLength(0);
    });

    it('should delete all notes', async () => {
      const notesRepo = new SQLiteNotesRepository(db as any);
      await notesRepo.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 1',
      });
      await notesRepo.createNote({
        kind: NoteKind.Prayer,
        content: 'Note 2',
      });

      await dataManager.deleteAllData();

      const notes = await notesRepo.getAllNotes();
      expect(notes).toHaveLength(0);
    });

    it('should delete all sessions', async () => {
      const sessionRepo = new SQLiteDailyPracticeRepository(db as any);
      await sessionRepo.createSession('2026-08-30');
      await sessionRepo.createSession('2026-08-31');

      await dataManager.deleteAllData();

      const incomplete = await sessionRepo.getIncompleteSessions();
      expect(incomplete).toHaveLength(0);
    });

    it('should preserve schema', async () => {
      const bookmarkRepo = new SQLiteBookmarkRepository(db as any);
      await bookmarkRepo.addBookmark({ book: 'John', chapter: 3, verse: 16 });

      await dataManager.deleteAllData();

      await expect(
        bookmarkRepo.addBookmark({ book: 'Genesis', chapter: 1, verse: 1 })
      ).resolves.toBeTruthy();
    });

    it('should result in zero stats', async () => {
      const bookmarkRepo = new SQLiteBookmarkRepository(db as any);
      const notesRepo = new SQLiteNotesRepository(db as any);

      await bookmarkRepo.addBookmark({ book: 'John', chapter: 3, verse: 16 });
      await notesRepo.createNote({
        kind: NoteKind.Reflection,
        content: 'Note',
      });

      await dataManager.deleteAllData();

      const stats = await dataManager.getDataStats();
      expect(stats).toEqual({
        bookmarks: 0,
        highlights: 0,
        notes: 0,
        guideThreads: 0,
        dailySessions: 0,
      });
    });
  });
});
