import { VerseRef } from './VerseRef';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export interface Highlight {
  id: string;
  verseRef: VerseRef;
  color: HighlightColor;
  createdAt: Date;
}
