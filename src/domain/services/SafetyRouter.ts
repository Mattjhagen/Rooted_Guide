/**
 * Safety routing service
 *
 * Provides compassionate routing for crisis scenarios (self-harm, abuse,
 * medical emergencies) while maintaining a non-blocking, non-shaming approach.
 */

import { SafetyCategory } from '../models/GuideServiceContract';

/**
 * Safety resources for different scenarios
 */
export interface SafetyResource {
  title: string;
  description: string;
  contacts: {
    name: string;
    phone?: string;
    text?: string;
    url?: string;
    availability: string;
    description?: string;
  }[];
}

/**
 * Safety message to display to users
 */
export interface SafetyMessage {
  category: SafetyCategory;
  message: string;
  resources?: SafetyResource;
  allowContinue: boolean; // Whether user can continue the conversation
}

/**
 * Routes safety concerns to appropriate resources and messaging
 */
export class SafetyRouter {
  /**
   * Get appropriate safety message and resources for a response category
   */
  getSafetyMessage(category: SafetyCategory): SafetyMessage | null {
    switch (category) {
      case 'crisis':
        return this.getCrisisMessage();

      case 'needs_support':
        return this.getSupportMessage();

      case 'off_topic':
        return this.getOffTopicMessage();

      case 'safe':
        return null; // No special handling needed

      default:
        // Unknown category - treat as needing support
        return this.getSupportMessage();
    }
  }

  private getCrisisMessage(): SafetyMessage {
    return {
      category: 'crisis',
      message:
        "I'm here with you, but what you're sharing sounds like something that needs immediate, professional support. You deserve real help right now.",
      resources: {
        title: 'Immediate Support',
        description: 'These services are available 24/7 and confidential:',
        contacts: [
          {
            name: '988 Suicide & Crisis Lifeline',
            phone: '988',
            text: '988',
            availability: '24/7',
          },
          {
            name: 'Crisis Text Line',
            text: 'HOME to 741741',
            availability: '24/7',
          },
          {
            name: 'National Domestic Violence Hotline',
            phone: '1-800-799-7233',
            availability: '24/7',
          },
          {
            name: 'RAINN Sexual Assault Hotline',
            phone: '1-800-656-4673',
            availability: '24/7',
          },
          {
            name: 'Emergency Services',
            phone: '911',
            availability: 'Immediate',
          },
        ],
      },
      allowContinue: true, // Don't block - respect user autonomy
    };
  }

  private getSupportMessage(): SafetyMessage {
    return {
      category: 'needs_support',
      message:
        "What you're going through sounds hard. While I can walk with you through Scripture, these situations often benefit from talking with someone trained to help—like a counselor, therapist, or trusted person in your life.",
      resources: {
        title: 'Finding Support',
        description: 'Consider reaching out:',
        contacts: [
          {
            name: 'SAMHSA National Helpline',
            phone: '1-800-662-4357',
            availability: '24/7, Free and confidential',
            description: 'Mental health and substance use information and referrals',
          },
          {
            name: 'Your healthcare provider',
            availability: 'For medical concerns',
            description: 'Can provide referrals to mental health professionals',
          },
          {
            name: 'Local faith community',
            availability: 'Varies',
            description: 'Many offer pastoral care and counseling referrals',
          },
        ],
      },
      allowContinue: true,
    };
  }

  private getOffTopicMessage(): SafetyMessage {
    return {
      category: 'off_topic',
      message:
        "I'm here to explore Scripture and walk with you through biblical reflection. For other questions, I might not be the best guide—but I'm happy to return to Scripture whenever you're ready.",
      allowContinue: true,
    };
  }

  /**
   * Check if a safety message should be shown immediately
   * (versus letting the AI response be shown with safety info alongside)
   */
  shouldShowImmediately(category: SafetyCategory): boolean {
    return category === 'crisis';
  }

  /**
   * Check if a safety message should be shown as supplementary info
   */
  shouldShowSupplementary(category: SafetyCategory): boolean {
    return category === 'needs_support';
  }
}
