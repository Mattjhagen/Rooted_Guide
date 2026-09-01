import { Verse, BibleBook } from '@/domain/models';

/**
 * TEST FIXTURE DATA
 *
 * This is a minimal Scripture corpus created specifically for prototype and testing.
 * This is NOT the production Bible corpus and does NOT represent any complete translation.
 *
 * Production Bible data will be imported and verified in Prompt 3.
 */
export const TEST_VERSES: Verse[] = [
  // Genesis 1:1-3 (Creation opening)
  {
    ref: { book: BibleBook.Genesis, chapter: 1, verse: 1 },
    text: 'In the beginning, God created the heavens and the earth.',
    translation: 'TEST',
  },
  {
    ref: { book: BibleBook.Genesis, chapter: 1, verse: 2 },
    text: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.',
    translation: 'TEST',
  },
  {
    ref: { book: BibleBook.Genesis, chapter: 1, verse: 3 },
    text: 'And God said, "Let there be light," and there was light.',
    translation: 'TEST',
  },
  // John 3:1-2, 16-17 (Gospel core)
  {
    ref: { book: BibleBook.John, chapter: 3, verse: 1 },
    text: 'Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.',
    translation: 'TEST',
  },
  {
    ref: { book: BibleBook.John, chapter: 3, verse: 2 },
    text: 'This man came to Jesus by night and said to him, "Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do unless God is with him."',
    translation: 'TEST',
  },
  {
    ref: { book: BibleBook.John, chapter: 3, verse: 16 },
    text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    translation: 'TEST',
  },
  {
    ref: { book: BibleBook.John, chapter: 3, verse: 17 },
    text: 'For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him.',
    translation: 'TEST',
  },
  // Psalm 23:1-2 (Comfort)
  {
    ref: { book: BibleBook.Psalms, chapter: 23, verse: 1 },
    text: 'The LORD is my shepherd; I shall not want.',
    translation: 'TEST',
  },
  {
    ref: { book: BibleBook.Psalms, chapter: 23, verse: 2 },
    text: 'He makes me lie down in green pastures. He leads me beside still waters.',
    translation: 'TEST',
  },
  // Matthew 6:33 (Seeking God)
  {
    ref: { book: BibleBook.Matthew, chapter: 6, verse: 33 },
    text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
    translation: 'TEST',
  },
];
