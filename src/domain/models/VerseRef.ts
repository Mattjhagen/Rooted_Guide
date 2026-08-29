import { BibleBookValue } from './BibleBook';

/**
 * Represents a reference to a single chapter in the Bible
 */
export interface ChapterRef {
  book: BibleBookValue;
  chapter: number;
}

/**
 * Represents a reference to a single verse in the Bible
 */
export interface VerseRef {
  book: BibleBookValue;
  chapter: number;
  verse: number;
}

/**
 * Represents a reference to a passage (range of verses)
 */
export interface PassageRef {
  book: BibleBookValue;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

/**
 * Validates that a VerseRef has positive integers for chapter and verse
 */
export function isValidVerseRef(ref: unknown): ref is VerseRef {
  if (typeof ref !== 'object' || ref === null) return false;
  const r = ref as Record<string, unknown>;
  return (
    typeof r.book === 'string' &&
    typeof r.chapter === 'number' &&
    typeof r.verse === 'number' &&
    r.chapter > 0 &&
    r.verse > 0 &&
    Number.isInteger(r.chapter) &&
    Number.isInteger(r.verse)
  );
}

/**
 * Validates that a PassageRef has a valid range
 */
export function isValidPassageRef(ref: unknown): ref is PassageRef {
  if (typeof ref !== 'object' || ref === null) return false;
  const r = ref as Record<string, unknown>;
  return (
    typeof r.book === 'string' &&
    typeof r.chapter === 'number' &&
    typeof r.verseStart === 'number' &&
    typeof r.verseEnd === 'number' &&
    r.chapter > 0 &&
    r.verseStart > 0 &&
    r.verseEnd >= r.verseStart &&
    Number.isInteger(r.chapter) &&
    Number.isInteger(r.verseStart) &&
    Number.isInteger(r.verseEnd)
  );
}

/**
 * Formats a VerseRef as a readable string (e.g., "John 3:16")
 */
export function formatVerseRef(ref: VerseRef): string {
  return `${ref.book} ${ref.chapter}:${ref.verse}`;
}

/**
 * Formats a PassageRef as a readable string (e.g., "John 3:16-17")
 */
export function formatPassageRef(ref: PassageRef): string {
  return `${ref.book} ${ref.chapter}:${ref.verseStart}-${ref.verseEnd}`;
}
