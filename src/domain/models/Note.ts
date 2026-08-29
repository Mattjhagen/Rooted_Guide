import { VerseRef } from './VerseRef';

export enum NoteKind {
  Reflection = 'reflection',
  Prayer = 'prayer',
}

export interface Note {
  id: string;
  kind: NoteKind;
  content: string;
  verseRef?: VerseRef;
  createdAt: Date;
  updatedAt: Date;
}
