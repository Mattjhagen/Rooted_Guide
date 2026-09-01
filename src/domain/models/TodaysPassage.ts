/**
 * Today's Passage
 *
 * Fixed passage for daily practice.
 * In production, this would be determined by a daily reading plan.
 */

import { PassageRef } from './VerseRef';

export interface TodaysPassage {
  ref: PassageRef;
  title: string;
}

export const TODAYS_PASSAGE: TodaysPassage = {
  ref: {
    book: 'John',
    chapter: 3,
    verseStart: 16,
    verseEnd: 21,
  },
  title: 'John 3:16-21',
};
