import { GuideRequest, GuideResponse } from '../models';

/**
 * Gateway interface for AI-powered guide conversations
 * Production implementation will use server-side AI with credential rotation
 */
export interface GuideGateway {
  /**
   * Send a request to the guide and receive a structured response
   */
  sendMessage(request: GuideRequest): Promise<GuideResponse>;
}
