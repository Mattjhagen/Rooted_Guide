import { VerseRef } from './VerseRef';

/**
 * Represents the full content of a Bible verse
 */
export interface Verse {
  ref: VerseRef;
  text: string;
  translation: string; // e.g., "WEB", "NIV", "ESV"
}
