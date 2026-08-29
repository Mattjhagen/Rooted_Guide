import { BibleRepository } from '@/domain/repositories';
import { Verse, VerseRef, ChapterRef, PassageRef } from '@/domain/models';
import { TEST_VERSES } from './testFixtures';

/**
 * In-memory implementation of BibleRepository using test fixtures
 * This allows the vertical slice to work without a database or production Bible corpus
 */
export class MockBibleRepository implements BibleRepository {
  private verses: Verse[] = TEST_VERSES;

  async getVerse(ref: VerseRef): Promise<Verse | null> {
    const verse = this.verses.find(
      (v) => v.ref.book === ref.book && v.ref.chapter === ref.chapter && v.ref.verse === ref.verse
    );
    return verse || null;
  }

  async getChapter(ref: ChapterRef): Promise<Verse[]> {
    return this.verses.filter((v) => v.ref.book === ref.book && v.ref.chapter === ref.chapter);
  }

  async getPassage(ref: PassageRef): Promise<Verse[]> {
    return this.verses.filter(
      (v) =>
        v.ref.book === ref.book &&
        v.ref.chapter === ref.chapter &&
        v.ref.verse >= ref.verseStart &&
        v.ref.verse <= ref.verseEnd
    );
  }

  async searchVerses(query: string, limit: number = 10): Promise<Verse[]> {
    const lowerQuery = query.toLowerCase();
    return this.verses.filter((v) => v.text.toLowerCase().includes(lowerQuery)).slice(0, limit);
  }
}
