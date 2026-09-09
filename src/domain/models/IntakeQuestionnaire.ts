/**
 * Intake Questionnaire Models
 *
 * Defines the 3-question intake process used to generate a personalized Scripture reading plan.
 */

export type SeasonFocus = 'peace' | 'difficulty' | 'faith' | 'wisdom';
export type ReadingDepth = 'gentle' | 'focused' | 'deep';
export type ScriptureGenre = 'psalms' | 'gospels' | 'epistles' | 'promises';

export interface UserIntakeAnswers {
  focus: SeasonFocus;
  depth: ReadingDepth;
  genre: ScriptureGenre;
}

export interface IntakeQuestionOption<T> {
  value: T;
  label: string;
  description: string;
}

export interface IntakeQuestion<T> {
  id: keyof UserIntakeAnswers;
  title: string;
  subtitle: string;
  options: IntakeQuestionOption<T>[];
}

export const INTAKE_QUESTIONS: [
  IntakeQuestion<SeasonFocus>,
  IntakeQuestion<ReadingDepth>,
  IntakeQuestion<ScriptureGenre>,
] = [
  {
    id: 'focus',
    title: 'Focus for this season',
    subtitle: 'What is on your heart right now?',
    options: [
      {
        value: 'peace',
        label: 'Seeking peace & rest',
        description: 'Quiet reflection for anxious or heavy hearts',
      },
      {
        value: 'difficulty',
        label: 'Navigating difficulty or grief',
        description: 'Comfort and strength during trials',
      },
      {
        value: 'faith',
        label: 'Strengthening faith & trust',
        description: 'Building deeper confidence in God',
      },
      {
        value: 'wisdom',
        label: 'Wisdom & guidance',
        description: 'Clarity for decisions and daily living',
      },
    ],
  },
  {
    id: 'depth',
    title: 'Reading depth',
    subtitle: 'How would you like to engage today?',
    options: [
      {
        value: 'gentle',
        label: 'Gentle (Key verse)',
        description: 'A single grounding verse to meditate on',
      },
      {
        value: 'focused',
        label: 'Focused (Short passage)',
        description: '5 to 10 verses with rich context',
      },
      {
        value: 'deep',
        label: 'Deep (Full chapter)',
        description: 'An entire chapter for immersive reading',
      },
    ],
  },
  {
    id: 'genre',
    title: 'Scripture focus',
    subtitle: 'Where would you like to begin?',
    options: [
      {
        value: 'psalms',
        label: 'Psalms & Wisdom',
        description: 'Prayers, poetry, and reflective guidance',
      },
      {
        value: 'gospels',
        label: 'Gospels & Jesus',
        description: 'The life, teachings, and grace of Christ',
      },
      {
        value: 'epistles',
        label: 'Epistles & Living',
        description: 'Practical encouragement for everyday faith',
      },
      {
        value: 'promises',
        label: 'Old Testament Promises',
        description: 'God’s faithfulness through history',
      },
    ],
  },
];
