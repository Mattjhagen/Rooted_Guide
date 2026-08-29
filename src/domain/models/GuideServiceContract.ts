/**
 * Server API contract for the Guide service
 *
 * This contract defines the structured request/response format between
 * the mobile client and the application server. The server mediates all
 * AI provider interactions and never exposes provider credentials to the client.
 */

import { BibleBookValue } from './BibleBook';

/**
 * Version of the API contract for forward/backward compatibility
 */
export const GUIDE_API_VERSION = '1.0';

/**
 * Safety category for guide responses
 */
export type SafetyCategory =
  | 'safe' // Normal conversation
  | 'needs_support' // User expressing distress, but not immediate danger
  | 'crisis' // Self-harm, abuse, medical emergency, or immediate danger
  | 'off_topic'; // Out of scope for a Scripture guide

/**
 * Citation supplied to the AI for grounding
 */
export interface SuppliedCitation {
  book: BibleBookValue;
  chapter: number;
  verse: number;
  text: string; // Verified text from local Bible
}

/**
 * Citation ID returned from the AI (must match supplied citations)
 */
export interface CitationReference {
  book: BibleBookValue;
  chapter: number;
  verse: number;
}

/**
 * Request sent from client to server
 */
export interface GuideServiceRequest {
  /**
   * API version for compatibility
   */
  version: string;

  /**
   * User's input text
   */
  userInput: string;

  /**
   * Optional thread ID for conversation continuity
   */
  threadId?: string;

  /**
   * Supplied passages for grounding (verified from local Bible)
   */
  suppliedPassages?: SuppliedCitation[];

  /**
   * Bounded conversation context (last N turns)
   */
  context?: {
    recentTurns: {
      role: 'user' | 'guide';
      content: string;
    }[];
  };

  /**
   * Request ID for idempotency and retry safety
   */
  requestId: string;
}

/**
 * Structured response from server
 */
export interface GuideServiceResponse {
  /**
   * API version
   */
  version: string;

  /**
   * Request ID (echoed for correlation)
   */
  requestId: string;

  /**
   * Short, compassionate guidance text
   */
  text: string;

  /**
   * Citation references (must only reference supplied passages)
   */
  citations: CitationReference[];

  /**
   * Optional next reflection question or suggestion
   */
  nextQuestion?: string;

  /**
   * Safety category for routing and handling
   */
  safetyCategory: SafetyCategory;

  /**
   * Indicates when the AI is uncertain or lacks sufficient context
   */
  uncertaintyFlag?: boolean;

  /**
   * Timestamp of response generation
   */
  timestamp: string;
}

/**
 * Error response from server
 */
export interface GuideServiceError {
  error: {
    code: string;
    message: string;
    recoverable: boolean;
    retryAfter?: number; // Seconds to wait before retry
  };
}

/**
 * Type guard for error responses
 */
export function isGuideServiceError(
  response: GuideServiceResponse | GuideServiceError
): response is GuideServiceError {
  return 'error' in response;
}
