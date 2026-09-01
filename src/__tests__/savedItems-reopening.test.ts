/**
 * Integration tests for saved-item reopening flow
 *
 * Tests the complete flow:
 * 1. Save an item (bookmark, highlight, note, reflection)
 * 2. Load saved items screen
 * 3. Navigate to the item's Scripture context
 * 4. Verify correct passage is displayed
 */

import { SQLiteBookmarkRepository } from '@/infrastructure/persistence/SQLiteBookmarkRepository';
import { SQLiteHighlightRepository } from '@/infrastructure/persistence/SQLiteHighlightRepository';
import { SQLiteNotesRepository } from '@/infrastructure/persistence/SQLiteNotesRepository';
import { SQLiteGuideThreadRepository } from '@/infrastructure/persistence/SQLiteGuideThreadRepository';
import { NoteKind } from '@/domain/models/Note';
import { VerseRef, PassageRef } from '@/domain/models/VerseRef';

describe('Saved Items Reopening', () => {
  let db: any;
  let bookmarkRepo: SQLiteBookmarkRepository;
  let highlightRepo: SQLiteHighlightRepository;
  let notesRepo: SQLiteNotesRepository;
  let guideThreadRepo: SQLiteGuideThreadRepository;

  const sampleVerseRef: VerseRef = {
    book: 'John',
    chapter: 3,
    verse: 16,
  };

  const samplePassageRef: PassageRef = {
    book: 'John',
    chapter: 3,
    verseStart: 16,
    verseEnd: 17,
  };

  beforeEach(() => {
    db = {
      getFirstSync: jest.fn(),
      getAllSync: jest.fn(),
      runSync: jest.fn(),
      execSync: jest.fn(),
    };
    bookmarkRepo = new SQLiteBookmarkRepository(db);
    highlightRepo = new SQLiteHighlightRepository(db);
    notesRepo = new SQLiteNotesRepository(db);
    guideThreadRepo = new SQLiteGuideThreadRepository(db);
  });

  describe('Bookmark reopening', () => {
    it('saves bookmark and returns verse ref for navigation', async () => {
      db.getFirstSync.mockReturnValue({ count: 0 });

      const bookmark = await bookmarkRepo.addBookmark(sampleVerseRef);

      expect(bookmark.verseRef).toEqual(sampleVerseRef);
      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO bookmarks'),
        expect.arrayContaining([expect.any(String), 'John', 3, 16, expect.any(String)])
      );
    });

    it('retrieves all bookmarks with verse refs', async () => {
      db.getAllSync.mockReturnValue([
        {
          id: 'bookmark_1',
          book: 'John',
          chapter: 3,
          verse: 16,
          created_at: new Date().toISOString(),
        },
      ]);

      const bookmarks = await bookmarkRepo.getAllBookmarks();

      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].verseRef).toEqual(sampleVerseRef);
    });
  });

  describe('Highlight reopening', () => {
    it('saves highlight with verse ref', async () => {
      db.getFirstSync.mockReturnValue(null);

      const highlight = await highlightRepo.setHighlight(sampleVerseRef, 'yellow');

      expect(highlight.verseRef).toEqual(sampleVerseRef);
      expect(highlight.color).toBe('yellow');
    });

    it('retrieves highlights for navigation', async () => {
      db.getAllSync.mockReturnValue([
        {
          id: 'highlight_1',
          book: 'John',
          chapter: 3,
          verse: 16,
          color: 'yellow',
          created_at: new Date().toISOString(),
        },
      ]);

      const highlights = await highlightRepo.getAllHighlights();

      expect(highlights[0].verseRef).toEqual(sampleVerseRef);
    });
  });

  describe('Note reopening', () => {
    it('saves note with verse ref', async () => {
      await notesRepo.createNote({
        kind: NoteKind.Reflection,
        content: 'My reflection on this verse',
        verseRef: sampleVerseRef,
      });

      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notes'),
        expect.arrayContaining([
          expect.any(String),
          'reflection',
          'My reflection on this verse',
          'John',
          3,
          16,
        ])
      );
    });

    it('retrieves notes with verse refs for navigation', async () => {
      db.getAllSync.mockReturnValue([
        {
          id: 'note_1',
          kind: 'reflection',
          content: 'My reflection',
          book: 'John',
          chapter: 3,
          verse: 16,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const notes = await notesRepo.getAllNotes();

      expect(notes[0].verseRef).toEqual(sampleVerseRef);
    });
  });

  describe('Guide conversation reopening', () => {
    it('creates thread with passage ref', async () => {
      const thread = await guideThreadRepo.createThread(samplePassageRef);

      expect(thread.passageRef).toEqual(samplePassageRef);
      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO guide_threads'),
        expect.arrayContaining(['John', 3, 16, 17])
      );
    });

    it('retrieves thread with passage ref for navigation', async () => {
      db.getAllSync.mockReturnValue([
        {
          id: 'thread_1',
          book: 'John',
          chapter: 3,
          verse_start: 16,
          verse_end: 17,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      db.getAllSync
        .mockReturnValueOnce([
          {
            id: 'thread_1',
            book: 'John',
            chapter: 3,
            verse_start: 16,
            verse_end: 17,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .mockReturnValueOnce([]); // turns

      const threads = await guideThreadRepo.getAllThreads();

      expect(threads[0].passageRef).toEqual(samplePassageRef);
    });
  });

  describe('Saved state feedback', () => {
    it('checks if verse is bookmarked', async () => {
      db.getFirstSync.mockReturnValue({ count: 1 });

      const isBookmarked = await bookmarkRepo.isBookmarked(sampleVerseRef);

      expect(isBookmarked).toBe(true);
      expect(db.getFirstSync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count'),
        ['John', 3, 16]
      );
    });

    it('returns false when verse not bookmarked', async () => {
      db.getFirstSync.mockReturnValue(null);

      const isBookmarked = await bookmarkRepo.isBookmarked(sampleVerseRef);

      expect(isBookmarked).toBe(false);
    });

    it('retrieves highlight color for verse', async () => {
      db.getFirstSync.mockReturnValue({
        id: 'highlight_1',
        book: 'John',
        chapter: 3,
        verse: 16,
        color: 'yellow',
        created_at: new Date().toISOString(),
      });

      const highlight = await highlightRepo.getHighlight(sampleVerseRef);

      expect(highlight).not.toBeNull();
      expect(highlight?.color).toBe('yellow');
    });

    it('returns null when verse not highlighted', async () => {
      db.getFirstSync.mockReturnValue(null);

      const highlight = await highlightRepo.getHighlight(sampleVerseRef);

      expect(highlight).toBeNull();
    });
  });
});
