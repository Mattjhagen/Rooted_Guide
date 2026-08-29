/**
 * Citation validation service
 *
 * Ensures that all citations returned from the AI are grounded in
 * verified local Scripture and rejects any fabricated or unknown citations.
 */

import { BibleRepository } from '../repositories';
import {
  CitationReference,
  SuppliedCitation,
  GuideServiceResponse,
} from '../models/GuideServiceContract';
import { ScriptureCitation } from '../models/GuideThread';
import { BibleBookValue } from '../models/BibleBook';

/**
 * Validation result for a single citation
 */
export interface CitationValidationResult {
  isValid: boolean;
  citation: CitationReference;
  reason?: string;
}

/**
 * Validation result for an entire response
 */
export interface ResponseValidationResult {
  isValid: boolean;
  invalidCitations: CitationValidationResult[];
  validCitations: ScriptureCitation[];
}

/**
 * Validates citations against supplied passages and local Bible
 */
export class CitationValidator {
  constructor(private bibleRepository: BibleRepository) {}

  /**
   * Validate that a citation was present in the supplied passages
   */
  validateAgainstSupplied(
    citation: CitationReference,
    supplied: SuppliedCitation[]
  ): CitationValidationResult {
    const found = supplied.some(
      (s) =>
        s.book === citation.book && s.chapter === citation.chapter && s.verse === citation.verse
    );

    if (!found) {
      return {
        isValid: false,
        citation,
        reason: 'Citation was not in supplied passages',
      };
    }

    return { isValid: true, citation };
  }

  /**
   * Validate all citations in a response
   */
  async validateResponse(
    response: GuideServiceResponse,
    suppliedPassages: SuppliedCitation[]
  ): Promise<ResponseValidationResult> {
    const invalidCitations: CitationValidationResult[] = [];
    const validCitations: ScriptureCitation[] = [];

    for (const citation of response.citations) {
      // First check if it was in supplied passages
      const suppliedCheck = this.validateAgainstSupplied(citation, suppliedPassages);

      if (!suppliedCheck.isValid) {
        invalidCitations.push(suppliedCheck);
        continue;
      }

      // Then verify it exists in local Bible and fetch the verified text
      try {
        const verse = await this.bibleRepository.getVerse({
          book: citation.book as BibleBookValue,
          chapter: citation.chapter,
          verse: citation.verse,
        });

        if (!verse) {
          invalidCitations.push({
            isValid: false,
            citation,
            reason: 'Citation not found in local Bible database',
          });
          continue;
        }

        // Valid citation - use verified local text
        validCitations.push({
          book: citation.book,
          chapter: citation.chapter,
          verse: citation.verse,
          text: verse.text, // Always use verified local text
        });
      } catch (err) {
        invalidCitations.push({
          isValid: false,
          citation,
          reason: `Failed to verify citation: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
      }
    }

    return {
      isValid: invalidCitations.length === 0,
      invalidCitations,
      validCitations,
    };
  }

  /**
   * Reject response if it contains any invalid citations
   */
  rejectIfInvalid(validationResult: ResponseValidationResult): void {
    if (!validationResult.isValid) {
      const reasons = validationResult.invalidCitations
        .map((c) => `${c.citation.book} ${c.citation.chapter}:${c.citation.verse} - ${c.reason}`)
        .join('; ');

      throw new InvalidCitationError(
        `Response contains invalid citations: ${reasons}`,
        validationResult.invalidCitations
      );
    }
  }
}

/**
 * Error thrown when a response contains invalid citations
 */
export class InvalidCitationError extends Error {
  constructor(
    message: string,
    public invalidCitations: CitationValidationResult[]
  ) {
    super(message);
    this.name = 'InvalidCitationError';
  }
}
