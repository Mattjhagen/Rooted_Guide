/**
 * Guide service configuration
 *
 * Determines which GuideGateway implementation to use based on environment
 * and configuration. Never exposes provider secrets in the client.
 */

import { GuideGateway } from '@/domain/services';
import { HTTPGuideGateway } from '../adapters/HTTPGuideGateway';
import { LocalDevGuideGateway } from '../adapters/LocalDevGuideGateway';
import { OpenRouterGuideGateway } from '../adapters/OpenRouterGuideGateway';
import { BibleRepository } from '@/domain/repositories';

export interface GuideConfig {
  /**
   * Whether the guide service is available
   */
  isAvailable: boolean;

  /**
   * Reason if unavailable
   */
  unavailableReason?: string;

  /**
   * Base URL for the guide API (production only)
   */
  apiBaseUrl?: string;

  /**
   * OpenRouter API key if present
   */
  openRouterApiKey?: string;

  /**
   * Whether to use local development mock
   */
  useLocalDevMock: boolean;
}

export function getGuideConfig(): GuideConfig {
  const openRouterApiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const apiBaseUrl = process.env.EXPO_PUBLIC_GUIDE_API_URL;
  const useLocalDevMock = __DEV__ && !apiBaseUrl && !openRouterApiKey;

  const isAvailable = useLocalDevMock || !!apiBaseUrl || !!openRouterApiKey;

  let unavailableReason: string | undefined;
  if (!isAvailable) {
    unavailableReason = 'Guide service is not configured';
  }

  return {
    isAvailable,
    unavailableReason,
    apiBaseUrl,
    openRouterApiKey,
    useLocalDevMock,
  };
}

export function createGuideGateway(bibleRepository: BibleRepository): GuideGateway | null {
  const config = getGuideConfig();

  if (!config.isAvailable) {
    return null;
  }

  if (config.openRouterApiKey) {
    return new OpenRouterGuideGateway({
      apiKey: config.openRouterApiKey,
    });
  }

  if (config.useLocalDevMock) {
    return new LocalDevGuideGateway();
  }

  if (config.apiBaseUrl) {
    return new HTTPGuideGateway(
      {
        baseUrl: config.apiBaseUrl,
      },
      bibleRepository
    );
  }

  return null;
}

/**
 * Check if guide service is available
 */
export function isGuideServiceAvailable(): boolean {
  return getGuideConfig().isAvailable;
}

/**
 * Get user-friendly message for why guide is unavailable
 */
export function getUnavailableMessage(): string {
  const config = getGuideConfig();

  if (config.isAvailable) {
    return '';
  }

  return (
    config.unavailableReason ||
    'The conversational guide is temporarily unavailable. You can still explore Scripture directly.'
  );
}
