import { MockBibleRepository } from '../infrastructure/adapters/MockBibleRepository';
import { BibleBook } from '../domain/models/BibleBook';

describe('MockBibleRepository', () => {
  let repository: MockBibleRepository;

  beforeEach(() => {
    repository = new MockBibleRepository();
  });

  it('retrieves a specific verse', async () => {
    const verse = await repository.getVerse({
      book: BibleBook.John,
      chapter: 3,
      verse: 16,
    });

    expect(verse).not.toBeNull();
    expect(verse?.text).toContain('God so loved the world');
    expect(verse?.translation).toBe('TEST');
  });

  it('returns null for non-existent verse', async () => {
    const verse = await repository.getVerse({
      book: BibleBook.Romans,
      chapter: 8,
      verse: 28,
    });

    expect(verse).toBeNull();
  });

  it('retrieves all verses in a chapter', async () => {
    const verses = await repository.getChapter({
      book: BibleBook.Genesis,
      chapter: 1,
    });

    expect(verses).toHaveLength(3);
    expect(verses[0].ref.verse).toBe(1);
    expect(verses[2].ref.verse).toBe(3);
  });

  it('retrieves a passage range', async () => {
    const verses = await repository.getPassage({
      book: BibleBook.John,
      chapter: 3,
      verseStart: 16,
      verseEnd: 17,
    });

    expect(verses).toHaveLength(2);
    expect(verses[0].ref.verse).toBe(16);
    expect(verses[1].ref.verse).toBe(17);
  });

  it('searches verses by text content', async () => {
    const verses = await repository.searchVerses('shepherd');

    expect(verses.length).toBeGreaterThan(0);
    expect(verses[0].text).toContain('shepherd');
  });

  it('limits search results', async () => {
    const verses = await repository.searchVerses('the', 2);

    expect(verses.length).toBeLessThanOrEqual(2);
  });
});
