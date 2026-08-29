import { GuideGateway } from '@/domain/services';
import { GuideRequest, GuideResponse } from '@/domain/models';
import { BibleBook } from '@/domain/models';

/**
 * Deterministic mock implementation of GuideGateway
 * Creates brief conversational exchanges that naturally lead into Scripture
 * Does NOT call any external AI service
 */
export class MockGuideGateway implements GuideGateway {
  async sendMessage(request: GuideRequest): Promise<GuideResponse> {
    const input = request.userInput.toLowerCase();
    const turnCount = request.context?.previousTurns?.length || 0;

    // First exchange: brief acknowledgment + natural question
    if (turnCount === 0 || turnCount === 1) {
      return this.createFirstExchange(input);
    }

    // Second exchange: deeper response + transition to Scripture path
    if (turnCount === 2 || turnCount === 3) {
      return this.createSecondExchange(input);
    }

    // Third+ exchange: Present Verse of the Day path
    return this.createScripturePath(input);
  }

  private createFirstExchange(input: string): GuideResponse {
    // Brief, warm acknowledgment + natural question
    if (input.includes('anxious') || input.includes('worry') || input.includes('tired')) {
      return {
        text: "I hear that. These early hours can feel heavy. What's sitting with you this morning?",
        citations: [],
        suggestions: [],
      };
    }

    if (input.includes('grateful') || input.includes('thankful') || input.includes('good')) {
      return {
        text: "That's a gift. What are you noticing that feels good right now?",
        citations: [],
        suggestions: [],
      };
    }

    // Default first exchange
    return {
      text: 'Thank you for sharing that. How does this morning feel for you?',
      citations: [],
      suggestions: [],
    };
  }

  private createSecondExchange(input: string): GuideResponse {
    // Deeper acknowledgment + gentle transition to Scripture
    if (input.includes('work') || input.includes('pressure') || input.includes('stress')) {
      return {
        text: "That weight is real. Let's spend a few minutes with something that might speak to where you are. Would you like to receive today's passage?",
        citations: [],
        suggestions: [],
      };
    }

    if (input.includes('peace') || input.includes('rest') || input.includes('calm')) {
      return {
        text: "There's a verse today about rest that might meet you right there. Shall we look at it together?",
        citations: [],
        suggestions: [],
      };
    }

    // Default second exchange
    return {
      text: "I'd like to walk with you through today's passage. It's just 15 minutes—a space to arrive, receive, and reflect. Ready?",
      citations: [],
      suggestions: [],
    };
  }

  private createScripturePath(_input: string): GuideResponse {
    // Present Verse of the Day with 15-minute structured path
    // Arrive → Receive → Reflect → Respond → Close
    return {
      text: 'Here\'s today\'s verse. Take a moment to receive it:\n\n"Yahweh is my shepherd: I shall lack nothing."\n\nThis is from Psalm 23—a song about trust in the midst of uncertainty. David wrote this from experience: as a shepherd himself, he knew what it meant to guide and protect.\n\nLet the words settle. What does "I shall lack nothing" stir in you right now?',
      citations: [
        {
          book: BibleBook.Psalms,
          chapter: 23,
          verse: 1,
        },
        {
          book: BibleBook.Psalms,
          chapter: 23,
          verse: 2,
        },
        {
          book: BibleBook.Psalms,
          chapter: 23,
          verse: 3,
        },
      ],
      suggestions: [
        {
          type: 'reflection',
          text: 'Continue the conversation about this passage',
        },
      ],
    };
  }
}
