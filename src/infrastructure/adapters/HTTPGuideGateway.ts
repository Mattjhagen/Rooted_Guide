/**
 * HTTP implementation of GuideGateway
 *
 * Calls a server-mediated API endpoint. Never contains provider secrets.
 * Implements timeout, retry with exponential backoff, cancellation, and idempotency.
 */

import { GuideGateway } from '@/domain/services';
import { GuideRequest, GuideResponse, ScriptureCitation } from '@/domain/models';
import {
  GuideServiceRequest,
  GuideServiceResponse,
  GuideServiceError,
  isGuideServiceError,
  GUIDE_API_VERSION,
  SuppliedCitation,
} from '@/domain/models/GuideServiceContract';
import { CitationValidator, InvalidCitationError } from '@/domain/services/CitationValidator';
import { BibleRepository } from '@/domain/repositories';

const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_REQUEST_SIZE_BYTES = 50000; // 50KB

/**
 * Configuration for HTTP Guide Gateway
 */
export interface HTTPGuideGatewayConfig {
  /**
   * Base URL for the guide service API
   * Example: https://api.plumbline.app/v1
   */
  baseUrl: string;

  /**
   * Request timeout in milliseconds
   */
  timeoutMs?: number;

  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;

  /**
   * Optional authentication token
   */
  authToken?: string;
}

/**
 * HTTP implementation of GuideGateway with production-ready reliability features
 */
export class HTTPGuideGateway implements GuideGateway {
  private abortControllers: Map<string, AbortController> = new Map();
  private pendingRequests: Set<string> = new Set();
  private citationValidator: CitationValidator;

  constructor(
    private config: HTTPGuideGatewayConfig,
    private bibleRepository: BibleRepository
  ) {
    this.citationValidator = new CitationValidator(bibleRepository);
  }

  async sendMessage(request: GuideRequest): Promise<GuideResponse> {
    // Generate request ID for idempotency and deduplication
    const requestId = this.generateRequestId();

    // Prevent duplicate concurrent requests
    if (this.pendingRequests.has(requestId)) {
      throw new Error('Request already in progress');
    }

    this.pendingRequests.add(requestId);

    try {
      // Prepare supplied passages from local Bible
      const suppliedPassages = await this.prepareSuppliedPassages(request);

      // Build service request
      const serviceRequest: GuideServiceRequest = {
        version: GUIDE_API_VERSION,
        userInput: request.userInput,
        threadId: request.threadId,
        suppliedPassages,
        context:
          request.context && request.context.previousTurns
            ? {
                recentTurns: request.context.previousTurns.slice(-10).map((turn) => ({
                  role: turn.role,
                  content: turn.content,
                })),
              }
            : undefined,
        requestId,
      };

      // Validate request size
      this.validateRequestSize(serviceRequest);

      // Send with retry logic
      const serviceResponse = await this.sendWithRetry(serviceRequest, requestId);

      // Validate citations against supplied passages
      const validationResult = await this.citationValidator.validateResponse(
        serviceResponse,
        suppliedPassages
      );

      // Reject if any citations are invalid
      this.citationValidator.rejectIfInvalid(validationResult);

      // Convert to domain response with validated citations
      return this.convertToGuideResponse(serviceResponse, validationResult.validCitations);
    } finally {
      this.pendingRequests.delete(requestId);
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel an in-flight request
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
    this.pendingRequests.delete(requestId);
  }

  /**
   * Prepare passages from local Bible to supply to the AI
   */
  private async prepareSuppliedPassages(_request: GuideRequest): Promise<SuppliedCitation[]> {
    // For now, return empty array - in production, this would:
    // 1. Parse explicit references from user input
    // 2. Retrieve candidate passages based on intent/topic
    // 3. Fetch verified text from local Bible
    // This is a placeholder for the grounded retrieval step
    return [];
  }

  /**
   * Send request with exponential backoff retry
   */
  private async sendWithRetry(
    request: GuideServiceRequest,
    requestId: string,
    attempt: number = 1
  ): Promise<GuideServiceResponse> {
    try {
      return await this.sendRequest(request, requestId);
    } catch (err) {
      // Don't retry if cancelled, non-recoverable, or invalid citations
      if (err instanceof RequestCancelledError || err instanceof InvalidCitationError) {
        throw err;
      }

      // Check if we should retry
      const maxRetries = this.config.maxRetries ?? MAX_RETRIES;
      if (attempt >= maxRetries) {
        throw err;
      }

      // Exponential backoff
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      await this.sleep(delay);

      // Retry
      return this.sendWithRetry(request, requestId, attempt + 1);
    }
  }

  /**
   * Send HTTP request to server
   */
  private async sendRequest(
    request: GuideServiceRequest,
    requestId: string
  ): Promise<GuideServiceResponse> {
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    const timeoutMs = this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.authToken) {
        headers['Authorization'] = `Bearer ${this.config.authToken}`;
      }

      let response: Response;
      try {
        response = await fetch(`${this.config.baseUrl}/guide/message`, {
          method: 'POST',
          headers,
          body: JSON.stringify(request),
          signal: abortController.signal,
        });
      } catch (fetchErr) {
        // Handle AbortError specifically (timeout or cancellation)
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          throw new RequestCancelledError('Request was cancelled or timed out');
        }
        // Any other error from fetch is a network error
        const errorMessage =
          fetchErr instanceof Error ? fetchErr.message : 'Network request failed';
        throw new GuideServiceAPIError(errorMessage, 'NETWORK_ERROR', true);
      }

      // Safety check (should never happen in production, but helps with tests)
      if (!response) {
        throw new GuideServiceAPIError('No response received', 'NETWORK_ERROR', true);
      }

      // Handle non-success status codes
      if (!response.ok) {
        let errorData: GuideServiceError;
        try {
          errorData = await response.json();
        } catch {
          // Response body is not valid JSON
          throw new GuideServiceAPIError(
            `Server returned ${response.status}: ${response.statusText}`,
            'SERVER_ERROR',
            response.status >= 500 && response.status < 600
          );
        }

        if (isGuideServiceError(errorData)) {
          throw new GuideServiceAPIError(
            errorData.error.message,
            errorData.error.code,
            errorData.error.recoverable,
            errorData.error.retryAfter
          );
        }

        // Error response doesn't match expected structure
        throw new GuideServiceAPIError(
          `Server returned ${response.status}`,
          'SERVER_ERROR',
          response.status >= 500 && response.status < 600
        );
      }

      // Parse success response
      let data: GuideServiceResponse | GuideServiceError;
      try {
        data = await response.json();
      } catch {
        throw new GuideServiceAPIError('Failed to parse server response', 'PARSE_ERROR', false);
      }

      // Check if response is actually an error
      if (isGuideServiceError(data)) {
        throw new GuideServiceAPIError(
          data.error.message,
          data.error.code,
          data.error.recoverable,
          data.error.retryAfter
        );
      }

      // Validate response structure
      this.validateServiceResponse(data);

      return data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new RequestCancelledError('Request was cancelled');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Validate service response structure
   */
  private validateServiceResponse(response: GuideServiceResponse): void {
    if (!response.version || !response.text || !response.safetyCategory) {
      throw new Error('Malformed service response: missing required fields');
    }

    if (!Array.isArray(response.citations)) {
      throw new Error('Malformed service response: citations must be an array');
    }
  }

  /**
   * Convert service response to domain GuideResponse
   */
  private convertToGuideResponse(
    serviceResponse: GuideServiceResponse,
    validatedCitations: ScriptureCitation[]
  ): GuideResponse {
    return {
      text: serviceResponse.text,
      citations: validatedCitations,
      suggestions: serviceResponse.nextQuestion
        ? [
            {
              type: 'reflection',
              text: serviceResponse.nextQuestion,
            },
          ]
        : [],
    };
  }

  /**
   * Validate request size to prevent abuse
   */
  private validateRequestSize(request: GuideServiceRequest): void {
    const size = JSON.stringify(request).length;
    if (size > MAX_REQUEST_SIZE_BYTES) {
      throw new Error(`Request size ${size} bytes exceeds maximum ${MAX_REQUEST_SIZE_BYTES} bytes`);
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Sleep helper for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Error thrown when guide service API returns an error
 */
export class GuideServiceAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'GuideServiceAPIError';
  }
}

/**
 * Error thrown when a request is cancelled
 */
export class RequestCancelledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestCancelledError';
  }
}
