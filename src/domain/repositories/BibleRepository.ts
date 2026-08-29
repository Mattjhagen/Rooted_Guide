import { Verse, VerseRef, ChapterRef, PassageRef } from '../models';

/**
 * Repository interface for accessing Bible text and metadata
 */
export interface BibleRepository {
  /**
   * Get a single verse by reference
   */
  getVerse(ref: VerseRef): Promise<Verse | null>;

  /**
   * Get all verses in a chapter
   */
  getChapter(ref: ChapterRef): Promise<Verse[]>;

  /**
   * Get a range of verses (passage)
   */
  getPassage(ref: PassageRef): Promise<Verse[]>;

  /**
   * Search for verses containing the query text
   */
  searchVerses(query: string, limit?: number): Promise<Verse[]>;
}
