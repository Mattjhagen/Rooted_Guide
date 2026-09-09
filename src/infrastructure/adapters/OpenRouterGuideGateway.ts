import { GuideGateway } from '@/domain/services';
import { GuideRequest, GuideResponse } from '@/domain/models';

export interface OpenRouterConfig {
  apiKey?: string;
  model?: string;
  siteUrl?: string;
  siteName?: string;
}

const DEFAULT_MODEL = 'google/gemini-2.0-flash-lite:free';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Direct OpenRouter API implementation of GuideGateway
 * Uses high-performance free models like google/gemini-2.0-flash-lite:free
 */
export class OpenRouterGuideGateway implements GuideGateway {
  private apiKey: string;
  private model: string;
  private siteUrl: string;
  private siteName: string;

  constructor(config: OpenRouterConfig = {}) {
    this.apiKey = config.apiKey || process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
    this.model = config.model || process.env.EXPO_PUBLIC_OPENROUTER_MODEL || DEFAULT_MODEL;
    this.siteUrl = config.siteUrl || 'https://plumbline.rootedapp.space';
    this.siteName = config.siteName || 'Plumb Line';
  }

  async sendMessage(request: GuideRequest): Promise<GuideResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is missing. Set EXPO_PUBLIC_OPENROUTER_API_KEY.');
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are Plumb Line, a gentle, contemplative, scripture-grounded spiritual guide. Your purpose is to help users reflect deeply on Scripture, find peace, and apply biblical wisdom to their daily life. Keep responses warm, encouraging, concise, and focused on Jesus and God’s Word.',
      },
    ];

    if (request.context?.previousTurns) {
      for (const turn of request.context.previousTurns.slice(-6)) {
        messages.push({
          role: turn.role === 'user' ? 'user' : 'assistant',
          content: turn.content,
        });
      }
    }

    messages.push({
      role: 'user',
      content: request.userInput,
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const replyContent =
      data.choices?.[0]?.message?.content ||
      'I am reflecting with you in quiet prayer. Let us look to Scripture together.';

    return {
      text: replyContent,
      citations: [],
      suggestions: [
        { type: 'question', text: 'How does this passage speak to your heart today?' },
        { type: 'question', text: 'What is one prayer you can pray right now?' },
      ],
    };
  }

  async cancelRequest(_requestId?: string): Promise<void> {
    // No-op for direct fetch
  }
}
