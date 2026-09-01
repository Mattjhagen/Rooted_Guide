import { VerseRef } from './VerseRef';

/**
 * Reflection represents a user's response during daily practice
 *
 * Tied to a specific daily module and optionally to a Scripture passage.
 * Different from standalone Notes which are user-initiated.
 */

export type ReflectionKind = 'reflection' | 'prayer' | 'response' | 'arrive' | 'close';

export interface Reflection {
  id: string;
  moduleId?: string;
  kind: ReflectionKind;
  content: string;
  verseRef?: VerseRef;
  createdAt: Date;
  updatedAt: Date;
}
