/**
 * USFM Parser for World English Bible (engwebp)
 *
 * Parses Unified Standard Format Markers (USFM) Bible files,
 * extracting clean verse text by stripping markup while preserving wording.
 *
 * Operations performed (non-textual, preserve faithfulness):
 * - Remove \w word markers and Strong's numbers
 * - Remove \f footnote markers and content
 * - Remove \x cross-reference markers (if present)
 * - Normalize whitespace (collapse multiple spaces)
 * - Preserve paragraph breaks as natural spacing
 *
 * The displayed verse text remains byte-for-byte identical to source (minus markup).
 */

export interface USFMBook {
  id: string; // USFM book ID (e.g., "GEN", "PSA", "JHN")
  name: string; // Full book name (e.g., "Genesis", "Psalms", "John")
  chapters: USFMChapter[];
}

export interface USFMChapter {
  number: number;
  verses: USFMVerse[];
}

export interface USFMVerse {
  number: number;
  text: string; // Clean verse text with markup stripped
}

/**
 * Parse a single USFM file into structured book data
 */
export function parseUSFMFile(content: string, filename: string): USFMBook | null {
  const lines = content.split('\n');
  let bookId = '';
  let bookName = '';
  let currentChapter = 0;
  const chapters: Map<number, USFMVerse[]> = new Map();

  for (const line of lines) {
    const trimmed = line.trim();

    // Book identification
    if (trimmed.startsWith('\\id ')) {
      // Extract book ID from "\id GEN World English Bible (WEB)"
      const match = trimmed.match(/\\id\s+([A-Z0-9]+)/);
      if (match) {
        bookId = match[1];
      }
      continue;
    }

    // Table of contents name (full book name)
    if (trimmed.startsWith('\\toc2 ')) {
      bookName = trimmed.substring(6).trim();
      continue;
    }

    // Chapter marker
    if (trimmed.startsWith('\\c ')) {
      const match = trimmed.match(/\\c\s+(\d+)/);
      if (match) {
        currentChapter = parseInt(match[1], 10);
        if (!chapters.has(currentChapter)) {
          chapters.set(currentChapter, []);
        }
      }
      continue;
    }

    // Verse marker
    if (trimmed.startsWith('\\v ')) {
      if (currentChapter === 0) continue; // Skip verses before first chapter

      // Extract verse number and text
      const match = trimmed.match(/\\v\s+(\d+)\s+(.*)/);
      if (match) {
        const verseNumber = parseInt(match[1], 10);
        const verseText = match[2];

        // Clean the verse text
        const cleanText = cleanUSFMText(verseText);

        if (cleanText.length > 0) {
          const verses = chapters.get(currentChapter)!;
          verses.push({
            number: verseNumber,
            text: cleanText,
          });
        }
      }
    }
  }

  // Convert chapters map to sorted array
  const chaptersArray: USFMChapter[] = [];
  const sortedChapterNumbers = Array.from(chapters.keys()).sort((a, b) => a - b);

  for (const chapterNum of sortedChapterNumbers) {
    const verses = chapters.get(chapterNum)!;
    chaptersArray.push({
      number: chapterNum,
      verses: verses.sort((a, b) => a.number - b.number),
    });
  }

  // If no book ID extracted, derive from filename
  if (!bookId && filename) {
    const match = filename.match(/\d+-([A-Z0-9]+)/);
    if (match) {
      bookId = match[1];
    }
  }

  if (!bookId || chaptersArray.length === 0) {
    return null; // Invalid book file
  }

  return {
    id: bookId,
    name: bookName || bookId,
    chapters: chaptersArray,
  };
}

/**
 * Clean USFM markup from verse text
 *
 * Removes:
 * - Word markers: \w word|strong="H1234"\w*
 * - Footnotes: \f + \fr 1:1 \ft text\f*
 * - Cross-references: \x ... \x* (if present)
 * - Formatting markers: \+wh, \+wj, etc.
 * - Extra whitespace
 *
 * Preserves:
 * - Actual verse wording
 * - Punctuation
 * - Natural spacing
 */
export function cleanUSFMText(text: string): string {
  let cleaned = text;

  // Remove footnotes: \f + ... \f*
  // Use a more robust pattern that handles nested markers
  // Match from \f to \f* non-greedily
  cleaned = cleaned.replace(/\\f\s+\+[^]*?\\f\*/g, '');

  // Remove cross-references: \x ... \x*
  cleaned = cleaned.replace(/\\x\s+[^]*?\\x\*/g, '');

  // Remove word markers with Strong's numbers: \w word|strong="H1234"\w*
  cleaned = cleaned.replace(/\\w\s+([^|\\]+)\|strong="[^"]+"\s*\\w\*/g, '$1');

  // Remove word markers without attributes: \w word\w*
  cleaned = cleaned.replace(/\\w\s+([^\\]+?)\\w\*/g, '$1');

  // Remove words of Jesus markers: \wj and \wj*
  cleaned = cleaned.replace(/\\wj\s*/g, '');
  cleaned = cleaned.replace(/\\wj\*/g, '');

  // Remove inline word markers with Strong's: \+w word|strong="G1234"\+w*
  cleaned = cleaned.replace(/\\\+w\s+([^|\\]+)\|strong="[^"]+"\s*\\\+w\*/g, '$1');

  // Remove inline word markers without attributes: \+w word\+w*
  cleaned = cleaned.replace(/\\\+w\s+([^\\\+]+?)\\\+w\*/g, '$1');

  // Remove any remaining +marker content: \+wh text\+wh*
  cleaned = cleaned.replace(/\\\+\w+\s+[^\\]+?\\\+\w+\*/g, '');

  // Remove any standalone +markers and +marker endings
  cleaned = cleaned.replace(/\\\+\w+\s*/g, '');
  cleaned = cleaned.replace(/\\\+\w+\*/g, '');

  // Remove any remaining backslash markers (but preserve text between them)
  cleaned = cleaned.replace(/\\[a-z0-9]+\*?/gi, '');

  // Remove standalone asterisks (leftover from markers)
  cleaned = cleaned.replace(/\s+\*\s+/g, ' ');
  cleaned = cleaned.replace(/\s+\*$/g, '');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * USFM book ID to canonical book name mapping
 * Maps USFM 3-letter codes to full English book names
 */
export const USFM_BOOK_NAMES: Record<string, string> = {
  // Old Testament
  GEN: 'Genesis',
  EXO: 'Exodus',
  LEV: 'Leviticus',
  NUM: 'Numbers',
  DEU: 'Deuteronomy',
  JOS: 'Joshua',
  JDG: 'Judges',
  RUT: 'Ruth',
  '1SA': '1 Samuel',
  '2SA': '2 Samuel',
  '1KI': '1 Kings',
  '2KI': '2 Kings',
  '1CH': '1 Chronicles',
  '2CH': '2 Chronicles',
  EZR: 'Ezra',
  NEH: 'Nehemiah',
  EST: 'Esther',
  JOB: 'Job',
  PSA: 'Psalms',
  PRO: 'Proverbs',
  ECC: 'Ecclesiastes',
  SNG: 'Song of Solomon',
  ISA: 'Isaiah',
  JER: 'Jeremiah',
  LAM: 'Lamentations',
  EZK: 'Ezekiel',
  DAN: 'Daniel',
  HOS: 'Hosea',
  JOL: 'Joel',
  AMO: 'Amos',
  OBA: 'Obadiah',
  JON: 'Jonah',
  MIC: 'Micah',
  NAM: 'Nahum',
  HAB: 'Habakkuk',
  ZEP: 'Zephaniah',
  HAG: 'Haggai',
  ZEC: 'Zechariah',
  MAL: 'Malachi',

  // New Testament
  MAT: 'Matthew',
  MRK: 'Mark',
  LUK: 'Luke',
  JHN: 'John',
  ACT: 'Acts',
  ROM: 'Romans',
  '1CO': '1 Corinthians',
  '2CO': '2 Corinthians',
  GAL: 'Galatians',
  EPH: 'Ephesians',
  PHP: 'Philippians',
  COL: 'Colossians',
  '1TH': '1 Thessalonians',
  '2TH': '2 Thessalonians',
  '1TI': '1 Timothy',
  '2TI': '2 Timothy',
  TIT: 'Titus',
  PHM: 'Philemon',
  HEB: 'Hebrews',
  JAS: 'James',
  '1PE': '1 Peter',
  '2PE': '2 Peter',
  '1JN': '1 John',
  '2JN': '2 John',
  '3JN': '3 John',
  JUD: 'Jude',
  REV: 'Revelation',
};

/**
 * Get canonical book order (1-66) from USFM book ID
 * Returns null for non-canonical books
 */
export function getCanonicalBookOrder(usfmId: string): number | null {
  const order: Record<string, number> = {
    GEN: 1,
    EXO: 2,
    LEV: 3,
    NUM: 4,
    DEU: 5,
    JOS: 6,
    JDG: 7,
    RUT: 8,
    '1SA': 9,
    '2SA': 10,
    '1KI': 11,
    '2KI': 12,
    '1CH': 13,
    '2CH': 14,
    EZR: 15,
    NEH: 16,
    EST: 17,
    JOB: 18,
    PSA: 19,
    PRO: 20,
    ECC: 21,
    SNG: 22,
    ISA: 23,
    JER: 24,
    LAM: 25,
    EZK: 26,
    DAN: 27,
    HOS: 28,
    JOL: 29,
    AMO: 30,
    OBA: 31,
    JON: 32,
    MIC: 33,
    NAM: 34,
    HAB: 35,
    ZEP: 36,
    HAG: 37,
    ZEC: 38,
    MAL: 39,
    MAT: 40,
    MRK: 41,
    LUK: 42,
    JHN: 43,
    ACT: 44,
    ROM: 45,
    '1CO': 46,
    '2CO': 47,
    GAL: 48,
    EPH: 49,
    PHP: 50,
    COL: 51,
    '1TH': 52,
    '2TH': 53,
    '1TI': 54,
    '2TI': 55,
    TIT: 56,
    PHM: 57,
    HEB: 58,
    JAS: 59,
    '1PE': 60,
    '2PE': 61,
    '1JN': 62,
    '2JN': 63,
    '3JN': 64,
    JUD: 65,
    REV: 66,
  };

  return order[usfmId] ?? null;
}
