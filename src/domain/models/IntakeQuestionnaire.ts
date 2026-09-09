/**
 * Intake Questionnaire Models
 *
 * Defines the 3-question intake process used to generate a personalized Scripture reading plan.
 */

export type SeasonFocus = 'peace' | 'difficulty' | 'faith' | 'wisdom';
export type ReadingDepth = 'gentle' | 'focused' | 'deep';
export type ScriptureGenre = 'psalms' | 'gospels' | 'epistles' | 'promises';

export interface UserIntakeAnswers {
  userName?: string;
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
    title: 'What is on your heart in this season of your walk with God?',
    subtitle: "Select the area where you desire God's presence most right now.",
    options: [
      {
        value: 'peace',
        label: 'Seeking Peace & Rest',
        description: 'Quiet reflection for anxious, weary, or heavy hearts',
      },
      {
        value: 'difficulty',
        label: 'Navigating Trials & Grief',
        description: 'Comfort, strength, and hope during hard times',
      },
      {
        value: 'faith',
        label: 'Deepening Faith & Trust',
        description: "Building steadfast confidence in God's promises",
      },
      {
        value: 'wisdom',
        label: 'Wisdom & Direction',
        description: 'Clarity for daily decisions, relationships, and growth',
      },
    ],
  },
  {
    id: 'depth',
    title: 'How deeply would you like to immerse in Scripture each day?',
    subtitle: 'Choose a pace that fits your daily quiet time.',
    options: [
      {
        value: 'gentle',
        label: 'Gentle • Key Verse',
        description: 'A single grounding verse to memorize and carry with you',
      },
      {
        value: 'focused',
        label: 'Focused • Short Passage',
        description: '5 to 10 verses with context for quiet reflection',
      },
      {
        value: 'deep',
        label: 'Deep • Full Chapter',
        description: 'An entire chapter for rich, immersive study and prayer',
      },
    ],
  },
  {
    id: 'genre',
    title: "Where in God's Word do you feel drawn to begin?",
    subtitle: 'Your personalized plan will start in this section of Scripture.',
    options: [
      {
        value: 'psalms',
        label: 'Psalms & Wisdom',
        description: 'Prayers, poetry, and comforting songs of worship',
      },
      {
        value: 'gospels',
        label: 'Gospels & Jesus',
        description: 'The life, words, miracles, and grace of Christ',
      },
      {
        value: 'epistles',
        label: 'Epistles & Daily Living',
        description: 'Letters of encouragement and practical Christian living',
      },
      {
        value: 'promises',
        label: 'Old Testament Promises',
        description: "God's enduring covenants and proven faithfulness",
      },
    ],
  },
];
