/**
 * Daily Path Models
 *
 * Represents Plumb Line's 15-minute guided Scripture experience:
 * - Arrive: Settle and prepare
 * - Receive: Read today's passage
 * - Reflect: Consider what strikes you
 * - Respond: Personal response
 * - Close: Closing prayer or thought
 */

export type ModuleType = 'arrive' | 'read' | 'reflect' | 'respond' | 'close';

export interface DailyPathModule {
  type: ModuleType;
  title: string;
  prompt: string;
  placeholder: string;
}

export const DAILY_PATH_MODULES: DailyPathModule[] = [
  {
    type: 'arrive',
    title: 'Arrive',
    prompt: 'Take a moment to settle. What are you bringing into this time?',
    placeholder: "What's on your heart right now...",
  },
  {
    type: 'read',
    title: 'Read',
    prompt: "Read today's passage slowly. Let the words sit with you.",
    placeholder: 'What do you notice...',
  },
  {
    type: 'reflect',
    title: 'Reflect',
    prompt: 'What word, phrase, or image stays with you?',
    placeholder: 'What strikes you...',
  },
  {
    type: 'respond',
    title: 'Respond',
    prompt: 'How does this invitation meet you today?',
    placeholder: 'Your response...',
  },
  {
    type: 'close',
    title: 'Close',
    prompt: 'Offer a closing thought or prayer.',
    placeholder: 'Your closing prayer or thought...',
  },
];

export function getModuleIndex(type: ModuleType): number {
  return DAILY_PATH_MODULES.findIndex((m) => m.type === type);
}

export function getNextModule(current: ModuleType): ModuleType | null {
  const currentIndex = getModuleIndex(current);
  if (currentIndex === -1 || currentIndex === DAILY_PATH_MODULES.length - 1) {
    return null;
  }
  return DAILY_PATH_MODULES[currentIndex + 1].type;
}
