import { UserIntakeAnswers } from '@/domain/models/IntakeQuestionnaire';
import { PassageRef } from '@/domain/models/VerseRef';
import { BibleBook } from '@/domain/models/BibleBook';

export interface GeneratedPlan {
  title: string;
  subtitle: string;
  description: string;
  passageRef: PassageRef;
  arrivePrompt: string;
  reflectPrompt: string;
  respondPrompt: string;
}

/**
 * Curated Scripture pathways indexed by (genre + focus)
 */
const PLAN_CATALOG: Record<
  string,
  {
    title: string;
    description: string;
    passages: Record<'gentle' | 'focused' | 'deep', PassageRef>;
    arrivePrompt: string;
    reflectPrompt: string;
    respondPrompt: string;
  }
> = {
  'psalms-peace': {
    title: 'Peace in the Psalms',
    description: 'A calming journey into God as your refuge and shepherd.',
    passages: {
      gentle: { book: BibleBook.Psalms, chapter: 23, verseStart: 1, verseEnd: 3 },
      focused: { book: BibleBook.Psalms, chapter: 23, verseStart: 1, verseEnd: 6 },
      deep: { book: BibleBook.Psalms, chapter: 91, verseStart: 1, verseEnd: 16 },
    },
    arrivePrompt: 'Pause and take a deep breath. Release the anxieties of today.',
    reflectPrompt: 'Which words bring a sense of quiet stillness to your heart?',
    respondPrompt: 'How can you rest in God’s care today?',
  },
  'psalms-difficulty': {
    title: 'Comfort in Trials',
    description: 'Honest prayers for strength and refuge when times are heavy.',
    passages: {
      gentle: { book: BibleBook.Psalms, chapter: 46, verseStart: 1, verseEnd: 3 },
      focused: { book: BibleBook.Psalms, chapter: 46, verseStart: 1, verseEnd: 11 },
      deep: { book: BibleBook.Psalms, chapter: 34, verseStart: 1, verseEnd: 22 },
    },
    arrivePrompt: 'Bring your honest burdens and exhaustion into this space.',
    reflectPrompt: 'Where do you see God’s presence amid difficulty in this passage?',
    respondPrompt: 'What strength or hope do you ask God for right now?',
  },
  'psalms-faith': {
    title: 'Unshakable Trust',
    description: 'Anchoring your soul in the enduring faithfulness of God.',
    passages: {
      gentle: { book: BibleBook.Psalms, chapter: 62, verseStart: 5, verseEnd: 8 },
      focused: { book: BibleBook.Psalms, chapter: 62, verseStart: 1, verseEnd: 12 },
      deep: { book: BibleBook.Psalms, chapter: 103, verseStart: 1, verseEnd: 22 },
    },
    arrivePrompt: 'Settle yourself in the presence of the God who holds all things.',
    reflectPrompt: 'What attribute of God’s character stands out to you?',
    respondPrompt: 'Where in your life are you called to trust Him more fully?',
  },
  'psalms-wisdom': {
    title: 'Pathways of Wisdom',
    description: 'Seeking divine direction for your decisions and daily walk.',
    passages: {
      gentle: { book: BibleBook.Psalms, chapter: 119, verseStart: 105, verseEnd: 108 },
      focused: { book: BibleBook.Psalms, chapter: 1, verseStart: 1, verseEnd: 6 },
      deep: { book: BibleBook.Psalms, chapter: 119, verseStart: 1, verseEnd: 16 },
    },
    arrivePrompt: 'Clear your mind of competing voices and focus on His truth.',
    reflectPrompt: 'What insight or direction does this Scripture illuminate?',
    respondPrompt: 'What practical step of wisdom is God inviting you to take?',
  },

  'gospels-peace': {
    title: 'Resting in Christ',
    description: 'Experiencing the gentle invitation and peace of Jesus.',
    passages: {
      gentle: { book: BibleBook.Matthew, chapter: 11, verseStart: 28, verseEnd: 30 },
      focused: { book: BibleBook.John, chapter: 14, verseStart: 25, verseEnd: 27 },
      deep: { book: BibleBook.John, chapter: 15, verseStart: 1, verseEnd: 17 },
    },
    arrivePrompt: 'Hear Jesus inviting you to come to Him just as you are.',
    reflectPrompt: 'How does Jesus’ promise speak directly to your weary spirit?',
    respondPrompt: 'What burden can you lay down at Jesus’ feet right now?',
  },
  'gospels-difficulty': {
    title: 'Compassion of Jesus',
    description: 'Witnessing Christ’s tender care for those who suffer.',
    passages: {
      gentle: { book: BibleBook.John, chapter: 11, verseStart: 33, verseEnd: 36 },
      focused: { book: BibleBook.Mark, chapter: 4, verseStart: 35, verseEnd: 41 },
      deep: { book: BibleBook.Luke, chapter: 8, verseStart: 40, verseEnd: 56 },
    },
    arrivePrompt: 'Know that Jesus sees your tears and understands your trial.',
    reflectPrompt: 'How does Christ demonstrate His power and empathy here?',
    respondPrompt: 'How does knowing Jesus is in your storm change your perspective?',
  },
  'gospels-faith': {
    title: 'Following Jesus',
    description: 'Stepping out in bold faith to follow the Master.',
    passages: {
      gentle: { book: BibleBook.Mark, chapter: 9, verseStart: 23, verseEnd: 24 },
      focused: { book: BibleBook.Matthew, chapter: 14, verseStart: 25, verseEnd: 33 },
      deep: { book: BibleBook.Luke, chapter: 5, verseStart: 1, verseEnd: 11 },
    },
    arrivePrompt: 'Prepare your heart to hear the gentle command: "Follow Me."',
    reflectPrompt: 'Where do you see faith overcoming fear in this narrative?',
    respondPrompt: 'What is Jesus calling you to step out into today?',
  },
  'gospels-wisdom': {
    title: 'Teachings of the Kingdom',
    description: 'Living out the transformative sermon and wisdom of Jesus.',
    passages: {
      gentle: { book: BibleBook.Matthew, chapter: 6, verseStart: 33, verseEnd: 34 },
      focused: { book: BibleBook.Matthew, chapter: 6, verseStart: 25, verseEnd: 34 },
      deep: { book: BibleBook.Matthew, chapter: 5, verseStart: 1, verseEnd: 16 },
    },
    arrivePrompt: 'Sit quietly as a disciple listening to the Master on the hillside.',
    reflectPrompt: 'What principle of Kingdom living challenges or encourages you?',
    respondPrompt: 'How can you apply Jesus’ wisdom in your interactions today?',
  },

  'epistles-peace': {
    title: 'Peace That Surpasses Understanding',
    description: 'Living in the quiet confidence of God’s grace.',
    passages: {
      gentle: { book: BibleBook.Philippians, chapter: 4, verseStart: 6, verseEnd: 7 },
      focused: { book: BibleBook.Philippians, chapter: 4, verseStart: 4, verseEnd: 9 },
      deep: { book: BibleBook.Romans, chapter: 8, verseStart: 31, verseEnd: 39 },
    },
    arrivePrompt: 'Bring every worry into prayer with thanksgiving.',
    reflectPrompt: 'What truth guards your heart and mind in Christ Jesus?',
    respondPrompt: 'Where can you choose peace over anxiety today?',
  },
  'epistles-difficulty': {
    title: 'Endurance & Hope',
    description: 'Finding purpose and joy in the midst of trials.',
    passages: {
      gentle: { book: BibleBook.James, chapter: 1, verseStart: 2, verseEnd: 4 },
      focused: { book: BibleBook.Romans, chapter: 5, verseStart: 1, verseEnd: 5 },
      deep: { book: BibleBook.Corinthians2, chapter: 4, verseStart: 7, verseEnd: 18 },
    },
    arrivePrompt: 'Acknowledge your struggles, knowing God works through weakness.',
    reflectPrompt: 'How does eternal hope reframe current difficulties?',
    respondPrompt: 'What gives you endurance to keep moving forward in faith?',
  },
  'epistles-faith': {
    title: 'Rooted in Grace',
    description: 'Understanding your secure identity and faith in Christ.',
    passages: {
      gentle: { book: BibleBook.Ephesians, chapter: 2, verseStart: 8, verseEnd: 10 },
      focused: { book: BibleBook.Colossians, chapter: 3, verseStart: 1, verseEnd: 4 },
      deep: { book: BibleBook.Ephesians, chapter: 1, verseStart: 3, verseEnd: 14 },
    },
    arrivePrompt: 'Remember that you are fully known, loved, and redeemed in Christ.',
    reflectPrompt: 'What aspects of your identity in Christ shine through this text?',
    respondPrompt: 'How will walking in this truth change your day?',
  },
  'epistles-wisdom': {
    title: 'Walking in Love & Light',
    description: 'Practical guidance for godly character and wisdom.',
    passages: {
      gentle: { book: BibleBook.Colossians, chapter: 3, verseStart: 12, verseEnd: 14 },
      focused: { book: BibleBook.James, chapter: 3, verseStart: 13, verseEnd: 18 },
      deep: { book: BibleBook.Ephesians, chapter: 4, verseStart: 17, verseEnd: 32 },
    },
    arrivePrompt: 'Ask God to search your heart and give you ears to hear.',
    reflectPrompt: 'What specific virtue or action is highlighted here?',
    respondPrompt: 'How can you extend grace and wisdom to someone today?',
  },

  'promises-peace': {
    title: 'Everlasting Promises',
    description: 'Reflecting on God’s eternal covenant of peace.',
    passages: {
      gentle: { book: BibleBook.Isaiah, chapter: 26, verseStart: 3, verseEnd: 4 },
      focused: { book: BibleBook.Isaiah, chapter: 40, verseStart: 28, verseEnd: 31 },
      deep: { book: BibleBook.Isaiah, chapter: 43, verseStart: 1, verseEnd: 13 },
    },
    arrivePrompt: 'Fix your mind on the eternal, unchanging God.',
    reflectPrompt: 'What promise of God’s presence gives you deep comfort?',
    respondPrompt: 'How can you anchor your day in His steadfast love?',
  },
  'promises-difficulty': {
    title: 'God Our Deliverer',
    description: 'Standing on the unfailing promises of God in hard times.',
    passages: {
      gentle: { book: BibleBook.Isaiah, chapter: 41, verseStart: 10, verseEnd: 10 },
      focused: { book: BibleBook.Isaiah, chapter: 41, verseStart: 8, verseEnd: 13 },
      deep: { book: BibleBook.Joshua, chapter: 1, verseStart: 1, verseEnd: 9 },
    },
    arrivePrompt: 'Hear God saying to you: "Do not fear, for I am with you."',
    reflectPrompt: 'How does God’s pledge of support strengthen your heart?',
    respondPrompt: 'What fear can you surrender to God’s promise of victory?',
  },
  'promises-faith': {
    title: 'Covenant Faithfulness',
    description: 'Tracing God’s proven track record through generations.',
    passages: {
      gentle: { book: BibleBook.Lamentations, chapter: 3, verseStart: 22, verseEnd: 24 },
      focused: { book: BibleBook.Deuteronomy, chapter: 7, verseStart: 9, verseEnd: 11 },
      deep: { book: BibleBook.Genesis, chapter: 15, verseStart: 1, verseEnd: 6 },
    },
    arrivePrompt: 'Recall God’s past mercies and new morning compassion.',
    reflectPrompt: 'Why is God’s faithfulness a dependable foundation for your life?',
    respondPrompt: 'What covenant promise are you celebrating today?',
  },
  'promises-wisdom': {
    title: 'The Fear of the Lord',
    description: 'Proverbs and ancient wisdom for a well-ordered life.',
    passages: {
      gentle: { book: BibleBook.Proverbs, chapter: 3, verseStart: 5, verseEnd: 6 },
      focused: { book: BibleBook.Proverbs, chapter: 3, verseStart: 1, verseEnd: 8 },
      deep: { book: BibleBook.Proverbs, chapter: 2, verseStart: 1, verseEnd: 15 },
    },
    arrivePrompt: 'Acknowledge God in all your ways as you seek His counsel.',
    reflectPrompt: 'What promise is connected to trusting God over your own understanding?',
    respondPrompt: 'Where do you need to lean less on self and more on God’s guidance?',
  },
};

/**
 * Generate a personalized reading plan based on user's intake answers
 */
export function generateAdaptivePlan(answers: UserIntakeAnswers): GeneratedPlan {
  const key = `${answers.genre}-${answers.focus}`;
  const template = PLAN_CATALOG[key] || PLAN_CATALOG['psalms-peace'];
  const passageRef = template.passages[answers.depth] || template.passages.focused;

  const depthLabel =
    answers.depth === 'gentle' ? 'Gentle' : answers.depth === 'deep' ? 'Deep' : 'Focused';

  return {
    title: template.title,
    subtitle: `${depthLabel} Plan • ${answers.genre.toUpperCase()}`,
    description: template.description,
    passageRef,
    arrivePrompt: template.arrivePrompt,
    reflectPrompt: template.reflectPrompt,
    respondPrompt: template.respondPrompt,
  };
}
