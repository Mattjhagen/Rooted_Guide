import { VerseRef } from './VerseRef';

export interface Bookmark {
  id: string;
  verseRef: VerseRef;
  createdAt: Date;
}
