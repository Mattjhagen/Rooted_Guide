import { GuideGateway } from '@/domain/services';
import { GuideRequest, GuideResponse } from '@/domain/models';
import { BibleBook } from '@/domain/models';

/**
 * Deterministic mock implementation of GuideGateway
 * Returns structured responses based on simple keyword matching
 * Does NOT call any external AI service
 */
export class MockGuideGateway implements GuideGateway {
  async sendMessage(request: GuideRequest): Promise<GuideResponse> {
    const input = request.userInput.toLowerCase();

    // Determine response based on keywords
    if (input.includes('anxious') || input.includes('worry') || input.includes('afraid')) {
      return this.createAnxietyResponse();
    }

    if (input.includes('love') || input.includes('loved')) {
      return this.createLoveResponse();
    }

    if (
      input.includes('begin') ||
      input.includes('start') ||
      input.includes('creation') ||
      input.includes('beginning')
    ) {
      return this.createBeginningResponse();
    }

    if (input.includes('guidance') || input.includes('seeking') || input.includes('direction')) {
      return this.createGuidanceResponse();
    }

    // Default response
    return this.createDefaultResponse();
  }

  private createAnxietyResponse(): GuideResponse {
    return {
      text: "I hear that you're feeling anxious. Scripture reminds us that God cares for us deeply and invites us to bring our worries to Him. In Psalm 23, David describes God as a shepherd who provides rest and guidance even in difficult times.",
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
      ],
      suggestions: [
        {
          type: 'reflection',
          text: 'What would it look like to let God lead you beside still waters today?',
        },
        {
          type: 'related_verse',
          text: 'Explore what Jesus teaches about seeking God first',
          reference: {
            book: BibleBook.Matthew,
            chapter: 6,
            verse: 33,
          },
        },
        {
          type: 'question',
          text: 'What specific worry would you like to bring to God right now?',
        },
      ],
    };
  }

  private createLoveResponse(): GuideResponse {
    return {
      text: "God's love is at the very heart of the Gospel. John 3:16 is perhaps the most well-known verse in Scripture, and it beautifully captures the depth of God's love for humanity—a love so profound that He gave His Son.",
      citations: [
        {
          book: BibleBook.John,
          chapter: 3,
          verse: 16,
        },
        {
          book: BibleBook.John,
          chapter: 3,
          verse: 17,
        },
      ],
      suggestions: [
        {
          type: 'reflection',
          text: "How does knowing God's love changes how you see yourself?",
        },
        {
          type: 'question',
          text: 'Is there someone in your life who needs to hear about this love?',
        },
      ],
    };
  }

  private createBeginningResponse(): GuideResponse {
    return {
      text: 'The very first words of the Bible establish the foundation for everything that follows: God is the Creator. Genesis 1 shows us that God spoke creation into existence—He brought order out of chaos, light out of darkness.',
      citations: [
        {
          book: BibleBook.Genesis,
          chapter: 1,
          verse: 1,
        },
        {
          book: BibleBook.Genesis,
          chapter: 1,
          verse: 3,
        },
      ],
      suggestions: [
        {
          type: 'reflection',
          text: 'If God brought light out of darkness in creation, what darkness in your life might He illuminate?',
        },
        {
          type: 'related_verse',
          text: "Consider God's love demonstrated in the Gospel",
          reference: {
            book: BibleBook.John,
            chapter: 3,
            verse: 16,
          },
        },
      ],
    };
  }

  private createGuidanceResponse(): GuideResponse {
    return {
      text: "Jesus teaches us to prioritize seeking God's kingdom above all else. When we put God first, He promises to provide for our needs. This isn't about ignoring practical concerns, but about orienting our hearts toward what matters most.",
      citations: [
        {
          book: BibleBook.Matthew,
          chapter: 6,
          verse: 33,
        },
      ],
      suggestions: [
        {
          type: 'reflection',
          text: 'What does it look like to seek God first in your current situation?',
        },
        {
          type: 'related_verse',
          text: 'Read about God as shepherd and guide',
          reference: {
            book: BibleBook.Psalms,
            chapter: 23,
            verse: 1,
          },
        },
      ],
    };
  }

  private createDefaultResponse(): GuideResponse {
    return {
      text: "I'm here to help you explore Scripture and reflect on God's Word. Whether you're experiencing a specific emotion, have a question about faith, or want to dive into a particular passage, I'm ready to guide you.",
      citations: [
        {
          book: BibleBook.John,
          chapter: 3,
          verse: 16,
        },
      ],
      suggestions: [
        {
          type: 'question',
          text: "What's on your heart today?",
        },
        {
          type: 'reflection',
          text: 'Think about a time when you felt close to God',
        },
        {
          type: 'related_verse',
          text: 'Begin with the foundation: creation',
          reference: {
            book: BibleBook.Genesis,
            chapter: 1,
            verse: 1,
          },
        },
      ],
    };
  }
}
