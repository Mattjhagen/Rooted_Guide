/**
 * Represents a conversation thread between the user and the guide
 */

import { BibleBookValue } from './BibleBook';

export interface ScriptureCitation {
  book: BibleBookValue;
  chapter: number;
  verse: number;
  text?: string;
}

export interface GuideSuggestion {
  type: 'reflection' | 'question' | 'related_verse';
  text: string;
  reference?: ScriptureCitation;
}

export interface GuideTurn {
  id: string;
  role: 'user' | 'guide';
  content: string;
  citations?: ScriptureCitation[];
  suggestions?: GuideSuggestion[];
  timestamp: Date;
}

export interface GuideThread {
  id: string;
  turns: GuideTurn[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request to send to the guide
 */
export interface GuideRequest {
  userInput: string;
  threadId?: string;
  context?: {
    previousTurns?: GuideTurn[];
  };
}

/**
 * Structured response from the guide
 */
export interface GuideResponse {
  text: string;
  citations: ScriptureCitation[];
  suggestions: GuideSuggestion[];
}
