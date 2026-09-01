/**
 * Passage Loading Regression Tests
 *
 * Tests that Scripture passages load correctly from the bundled Bible database,
 * including the development fixture used in daily practice.
 */

import Database from 'better-sqlite3';
import { SQLiteBibleRepository } from '@/infrastructure/scripture/SQLiteBibleRepository';
import { TODAYS_PASSAGE } from '@/domain/models/TodaysPassage';

describe('Passage Loading', () => {
  let db: Database.Database;
  let repository: SQLiteBibleRepository;

  beforeAll(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');

    // Create minimal schema
    db.exec(`
      CREATE TABLE books (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE verses (
        id INTEGER PRIMARY KEY,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES books(id)
      );

      CREATE INDEX idx_verses_ref ON verses(book_id, chapter, verse);
    `);

    // Insert test data for John 3:16-21 (todays passage)
    db.exec("INSERT INTO books (id, name) VALUES (43, 'John')");

    const verses = [
      {
        verse: 16,
        text: 'For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.',
      },
      {
        verse: 17,
        text: "For God didn't send his Son into the world to judge the world, but that the world should be saved through him.",
      },
      {
        verse: 18,
        text: "He who believes in him is not judged. He who doesn't believe has been judged already, because he has not believed in the name of the only born Son of God.",
      },
      {
        verse: 19,
        text: 'This is the judgment, that the light has come into the world, and men loved the darkness rather than the light, for their works were evil.',
      },
      {
        verse: 20,
        text: "For everyone who does evil hates the light and doesn't come to the light, lest his works would be exposed.",
      },
      {
        verse: 21,
        text: 'But he who does the truth comes to the light, that his works may be revealed, that they have been done in God.',
      },
    ];

    const stmt = db.prepare(
      'INSERT INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)'
    );
    verses.forEach(({ verse, text }) => {
      stmt.run(43, 3, verse, text);
    });

    repository = new SQLiteBibleRepository(db as any);
  });

  afterAll(() => {
    db.close();
  });

  describe('Development Fixture', () => {
    it('should load todays passage (John 3:16-21)', async () => {
      const verses = await repository.getPassage(TODAYS_PASSAGE.ref);

      expect(verses).toHaveLength(6);
      expect(verses[0].ref).toEqual({
        book: 'John',
        chapter: 3,
        verse: 16,
      });
      expect(verses[0].text).toContain('For God so loved the world');
      expect(verses[5].ref.verse).toBe(21);
    });

    it('should load individual verses from the passage', async () => {
      const verse = await repository.getVerse({
        book: 'John',
        chapter: 3,
        verse: 16,
      });

      expect(verse).not.toBeNull();
      expect(verse?.text).toContain('For God so loved the world');
      expect(verse?.translation).toBe('WEB');
    });
  });

  describe('Passage Range Loading', () => {
    it('should load passage with single verse', async () => {
      const verses = await repository.getPassage({
        book: 'John',
        chapter: 3,
        verseStart: 16,
        verseEnd: 16,
      });

      expect(verses).toHaveLength(1);
      expect(verses[0].ref.verse).toBe(16);
    });

    it('should load passage with multiple verses', async () => {
      const verses = await repository.getPassage({
        book: 'John',
        chapter: 3,
        verseStart: 16,
        verseEnd: 18,
      });

      expect(verses).toHaveLength(3);
      expect(verses[0].ref.verse).toBe(16);
      expect(verses[2].ref.verse).toBe(18);
    });

    it('should return empty array for non-existent passage', async () => {
      const verses = await repository.getPassage({
        book: 'John',
        chapter: 99,
        verseStart: 1,
        verseEnd: 5,
      });

      expect(verses).toHaveLength(0);
    });
  });

  describe('Book Name Handling', () => {
    it('should handle book name lookup correctly', async () => {
      const verse = await repository.getVerse({
        book: 'John',
        chapter: 3,
        verse: 16,
      });

      expect(verse).not.toBeNull();
      expect(verse?.ref.book).toBe('John');
    });

    it('should return null for invalid book name', async () => {
      const verse = await repository.getVerse({
        book: 'InvalidBook' as any,
        chapter: 1,
        verse: 1,
      });

      expect(verse).toBeNull();
    });
  });

  describe('Database State', () => {
    it('should have verses in database', () => {
      const count = repository.getVerseCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should have books in database', () => {
      const count = repository.getBookCount();
      expect(count).toBeGreaterThan(0);
    });
  });
});
