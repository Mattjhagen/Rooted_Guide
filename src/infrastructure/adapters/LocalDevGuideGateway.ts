/**
 * LOCAL DEVELOPMENT MOCK ONLY
 *
 * This adapter simulates server responses for local development and testing.
 * It is clearly labeled and must never masquerade as production.
 *
 * ⚠️  THIS DOES NOT CALL ANY AI SERVICE
 * ⚠️  THIS IS NOT A PRODUCTION IMPLEMENTATION
 * ⚠️  USE HTTPGuideGateway WITH A REAL SERVER FOR PRODUCTION
 */

import { GuideGateway } from '@/domain/services';
import { GuideRequest, GuideResponse, BibleBook } from '@/domain/models';

/**
 * Local development mock that returns deterministic Scripture-focused responses
 *
 * This is for:
 * - Local simulator development without a backend
 * - Integration tests
 * - UI/UX prototyping
 *
 * It intentionally adds a delay to simulate network requests.
 */
export class LocalDevGuideGateway implements GuideGateway {
  private readonly simulatedDelayMs: number;

  constructor(simulatedDelayMs: number = 800) {
    this.simulatedDelayMs = simulatedDelayMs;

    // Log warning in development
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(
        '[LocalDevGuideGateway] Using LOCAL DEVELOPMENT MOCK. This is NOT connected to any AI service.'
      );
    }
  }

  async sendMessage(request: GuideRequest): Promise<GuideResponse> {
    // Simulate network delay
    await this.sleep(this.simulatedDelayMs);

    const input = request.userInput.toLowerCase();
    const turnCount = request.context?.previousTurns?.length || 0;

    // Simple conversational flow that leads to Scripture
    if (turnCount === 0 || turnCount === 1) {
      return this.firstExchange(input);
    }

    if (turnCount === 2 || turnCount === 3) {
      return this.secondExchange(input);
    }

    return this.scripturePath();
  }

  private firstExchange(input: string): GuideResponse {
    if (input.includes('anxious') || input.includes('worry') || input.includes('scared')) {
      return {
        text: "I hear that. What's weighing on you right now?",
        citations: [],
        suggestions: [],
      };
    }

    if (input.includes('grateful') || input.includes('thankful') || input.includes('blessed')) {
      return {
        text: "That's beautiful. What are you noticing today?",
        citations: [],
        suggestions: [],
      };
    }

    return {
      text: 'Thank you for sharing. How are you feeling this morning?',
      citations: [],
      suggestions: [],
    };
  }

  private secondExchange(input: string): GuideResponse {
    if (
      input.includes('work') ||
      input.includes('stress') ||
      input.includes('pressure') ||
      input.includes('tired')
    ) {
      return {
        text: "That weight is real. Let's spend a few minutes with Scripture that might meet you there. Ready?",
        citations: [],
        suggestions: [],
      };
    }

    return {
      text: "I'd like to walk with you through a passage. It's a space to arrive, receive, and reflect. Shall we begin?",
      citations: [],
      suggestions: [],
    };
  }

  private scripturePath(): GuideResponse {
    // Mock response with Psalm 23:1-3 citations
    return {
      text: 'Here is today\'s passage:\n\n"Yahweh is my shepherd: I shall lack nothing."\n\nThis is from Psalm 23—a song about trust in the midst of uncertainty. David knew what it meant to be both shepherd and sheep.\n\nWhat does "I shall lack nothing" stir in you?',
      citations: [
        {
          book: BibleBook.Psalms,
          chapter: 23,
          verse: 1,
          text: 'Yahweh is my shepherd: I shall lack nothing.',
        },
        {
          book: BibleBook.Psalms,
          chapter: 23,
          verse: 2,
          text: 'He makes me lie down in green pastures. He leads me beside still waters.',
        },
        {
          book: BibleBook.Psalms,
          chapter: 23,
          verse: 3,
          text: "He restores my soul. He guides me in the paths of righteousness for his name's sake.",
        },
      ],
      suggestions: [
        {
          type: 'reflection',
          text: 'Continue exploring this passage',
        },
      ],
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Returns true to indicate this is a mock implementation
   */
  isDevelopmentMock(): boolean {
    return true;
  }
}
