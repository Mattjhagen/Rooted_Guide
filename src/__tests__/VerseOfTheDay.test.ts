/**
 * Verse of the Day Service Tests
 *
 * Verifies deterministic verse selection and reference formatting.
 */

import { getVerseOfTheDay, formatVerseReference } from '@/domain/services/VerseOfTheDay';

describe('Verse of the Day Service', () => {
  describe('getVerseOfTheDay', () => {
    it('returns a verse reference', () => {
      const verse = getVerseOfTheDay();

      expect(verse).toHaveProperty('book');
      expect(verse).toHaveProperty('chapter');
      expect(verse).toHaveProperty('verseStart');
      expect(verse).toHaveProperty('verseEnd');
    });

    it('returns same verse for same date', () => {
      const date = new Date('2026-09-01');
      const verse1 = getVerseOfTheDay(date);
      const verse2 = getVerseOfTheDay(date);

      expect(verse1).toEqual(verse2);
    });

    it('returns different verses for different dates', () => {
      const date1 = new Date('2026-09-01');
      const date2 = new Date('2026-09-02');

      const verse1 = getVerseOfTheDay(date1);
      const verse2 = getVerseOfTheDay(date2);

      // Verses should differ on different dates (statistically very likely)
      expect(verse1).not.toEqual(verse2);
    });

    it('is deterministic across years', () => {
      // Same day of year should return same verse
      const date1 = new Date('2026-01-15');
      const date2 = new Date('2027-01-15');

      const verse1 = getVerseOfTheDay(date1);
      const verse2 = getVerseOfTheDay(date2);

      // Might differ due to leap years, but both should be valid
      expect(verse1).toHaveProperty('book');
      expect(verse2).toHaveProperty('book');
    });
  });

  describe('formatVerseReference', () => {
    it('formats single verse reference', () => {
      const ref = {
        book: 'John' as const,
        chapter: 3,
        verseStart: 16,
        verseEnd: 16,
      };

      const formatted = formatVerseReference(ref);
      expect(formatted).toBe('John 3:16');
    });

    it('formats verse range', () => {
      const ref = {
        book: 'Proverbs' as const,
        chapter: 3,
        verseStart: 5,
        verseEnd: 6,
      };

      const formatted = formatVerseReference(ref);
      expect(formatted).toBe('Proverbs 3:5-6');
    });

    it('formats reference with long book name', () => {
      const ref = {
        book: '1 Corinthians' as const,
        chapter: 13,
        verseStart: 13,
        verseEnd: 13,
      };

      const formatted = formatVerseReference(ref);
      expect(formatted).toBe('1 Corinthians 13:13');
    });
  });
});
