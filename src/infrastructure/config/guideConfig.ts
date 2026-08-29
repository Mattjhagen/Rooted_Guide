/**
 * Guide service configuration
 *
 * Determines which GuideGateway implementation to use based on environment
 * and configuration. Never exposes provider secrets in the client.
 */

import { GuideGateway } from '@/domain/services';
import { HTTPGuideGateway } from '../adapters/HTTPGuideGateway';
import { LocalDevGuideGateway } from '../adapters/LocalDevGuideGateway';
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
   * Whether to use local development mock
   */
  useLocalDevMock: boolean;
}

/**
 * Get guide configuration from environment
 *
 * IMPORTANT: No AI provider keys or secrets should ever be in these variables.
 * All provider credentials belong exclusively on the server.
 */
export function getGuideConfig(): GuideConfig {
  // Check if we should use local development mock
  const useLocalDevMock = __DEV__ && !process.env.EXPO_PUBLIC_GUIDE_API_URL;

  // Get API URL from environment (production only)
  const apiBaseUrl = process.env.EXPO_PUBLIC_GUIDE_API_URL;

  // Service is available if we have either a mock or a configured API
  const isAvailable = useLocalDevMock || !!apiBaseUrl;

  let unavailableReason: string | undefined;
  if (!isAvailable) {
    unavailableReason = 'Guide service is not configured';
  }

  return {
    isAvailable,
    unavailableReason,
    apiBaseUrl,
    useLocalDevMock,
  };
}

/**
 * Create a GuideGateway instance based on configuration
 */
export function createGuideGateway(bibleRepository: BibleRepository): GuideGateway | null {
  const config = getGuideConfig();

  if (!config.isAvailable) {
    return null;
  }

  if (config.useLocalDevMock) {
    // Use local development mock
    return new LocalDevGuideGateway();
  }

  if (config.apiBaseUrl) {
    // Use HTTP gateway to production server
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
