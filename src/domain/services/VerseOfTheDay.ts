/**
 * Verse of the Day Service
 *
 * Provides a deterministic daily verse selection from the local verified Bible corpus.
 * No external API calls - all verses are validated against the bundled SQLite database.
 */

import { PassageRef } from '../models/VerseRef';

/**
 * Curated verses for daily rotation
 *
 * These references are validated against the World English Bible corpus.
 */
const DAILY_VERSES: PassageRef[] = [
  { book: 'John', chapter: 3, verseStart: 16, verseEnd: 16 },
  { book: 'Psalms', chapter: 23, verseStart: 1, verseEnd: 1 },
  { book: 'Proverbs', chapter: 3, verseStart: 5, verseEnd: 6 },
  { book: 'Romans', chapter: 8, verseStart: 28, verseEnd: 28 },
  { book: 'Philippians', chapter: 4, verseStart: 13, verseEnd: 13 },
  { book: 'Matthew', chapter: 6, verseStart: 33, verseEnd: 33 },
  { book: 'Isaiah', chapter: 40, verseStart: 31, verseEnd: 31 },
  { book: 'Jeremiah', chapter: 29, verseStart: 11, verseEnd: 11 },
  { book: '1 Corinthians', chapter: 13, verseStart: 13, verseEnd: 13 },
  { book: 'Psalms', chapter: 46, verseStart: 1, verseEnd: 1 },
  { book: 'Joshua', chapter: 1, verseStart: 9, verseEnd: 9 },
  { book: 'Matthew', chapter: 5, verseStart: 14, verseEnd: 14 },
  { book: 'Galatians', chapter: 5, verseStart: 22, verseEnd: 23 },
  { book: 'Ephesians', chapter: 2, verseStart: 8, verseEnd: 9 },
  { book: 'Colossians', chapter: 3, verseStart: 23, verseEnd: 23 },
  { book: 'Hebrews', chapter: 11, verseStart: 1, verseEnd: 1 },
  { book: '1 Peter', chapter: 5, verseStart: 7, verseEnd: 7 },
  { book: 'Psalms', chapter: 119, verseStart: 105, verseEnd: 105 },
  { book: 'Proverbs', chapter: 16, verseStart: 3, verseEnd: 3 },
  { book: 'Romans', chapter: 12, verseStart: 2, verseEnd: 2 },
  { book: 'James', chapter: 1, verseStart: 5, verseEnd: 5 },
  { book: 'Matthew', chapter: 11, verseStart: 28, verseEnd: 28 },
  { book: 'Psalms', chapter: 27, verseStart: 1, verseEnd: 1 },
  { book: 'Isaiah', chapter: 41, verseStart: 10, verseEnd: 10 },
  { book: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 7 },
  { book: 'Romans', chapter: 5, verseStart: 8, verseEnd: 8 },
  { book: 'John', chapter: 14, verseStart: 27, verseEnd: 27 },
  { book: 'Psalms', chapter: 34, verseStart: 8, verseEnd: 8 },
  { book: 'Proverbs', chapter: 4, verseStart: 23, verseEnd: 23 },
  { book: '2 Timothy', chapter: 1, verseStart: 7, verseEnd: 7 },
  { book: 'Psalms', chapter: 37, verseStart: 4, verseEnd: 4 },
];

/**
 * Get verse of the day based on current date
 *
 * Uses a deterministic algorithm to select from curated verses.
 * Same date always returns same verse.
 */
export function getVerseOfTheDay(date: Date = new Date()): PassageRef {
  // Calculate day of year (1-365/366)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Select verse deterministically
  const index = dayOfYear % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

/**
 * Format verse reference for display
 */
export function formatVerseReference(ref: PassageRef): string {
  if (ref.verseStart === ref.verseEnd) {
    return `${ref.book} ${ref.chapter}:${ref.verseStart}`;
  }
  return `${ref.book} ${ref.chapter}:${ref.verseStart}-${ref.verseEnd}`;
}
