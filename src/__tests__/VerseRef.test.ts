import {
  isValidVerseRef,
  isValidPassageRef,
  formatVerseRef,
  formatPassageRef,
} from '../domain/models/VerseRef';
import { BibleBook } from '../domain/models/BibleBook';

describe('VerseRef validation', () => {
  describe('isValidVerseRef', () => {
    it('validates a correct verse reference', () => {
      const ref = { book: BibleBook.John, chapter: 3, verse: 16 };
      expect(isValidVerseRef(ref)).toBe(true);
    });

    it('rejects non-positive chapter numbers', () => {
      const ref = { book: BibleBook.John, chapter: 0, verse: 16 };
      expect(isValidVerseRef(ref)).toBe(false);
    });

    it('rejects non-positive verse numbers', () => {
      const ref = { book: BibleBook.John, chapter: 3, verse: 0 };
      expect(isValidVerseRef(ref)).toBe(false);
    });

    it('rejects non-integer chapter numbers', () => {
      const ref = { book: BibleBook.John, chapter: 3.5, verse: 16 };
      expect(isValidVerseRef(ref)).toBe(false);
    });

    it('rejects missing fields', () => {
      expect(isValidVerseRef({ book: BibleBook.John, chapter: 3 })).toBe(false);
    });

    it('rejects null', () => {
      expect(isValidVerseRef(null)).toBe(false);
    });
  });

  describe('isValidPassageRef', () => {
    it('validates a correct passage reference', () => {
      const ref = { book: BibleBook.John, chapter: 3, verseStart: 16, verseEnd: 17 };
      expect(isValidPassageRef(ref)).toBe(true);
    });

    it('allows single-verse passages', () => {
      const ref = { book: BibleBook.John, chapter: 3, verseStart: 16, verseEnd: 16 };
      expect(isValidPassageRef(ref)).toBe(true);
    });

    it('rejects invalid ranges', () => {
      const ref = { book: BibleBook.John, chapter: 3, verseStart: 17, verseEnd: 16 };
      expect(isValidPassageRef(ref)).toBe(false);
    });
  });

  describe('formatVerseRef', () => {
    it('formats a verse reference correctly', () => {
      const ref = { book: BibleBook.John, chapter: 3, verse: 16 };
      expect(formatVerseRef(ref)).toBe('John 3:16');
    });
  });

  describe('formatPassageRef', () => {
    it('formats a passage reference correctly', () => {
      const ref = { book: BibleBook.John, chapter: 3, verseStart: 16, verseEnd: 17 };
      expect(formatPassageRef(ref)).toBe('John 3:16-17');
    });
  });
});
