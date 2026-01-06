/**
 * Family/Household detection module
 */

import type { FamilyName, FamilyStyle, ReasonCode, Confidence, ParseMeta } from '../types';
import { startsWithThe, stripLeadingThe, hasPluralSurnameEnding, tokenize, isNameLikeToken } from '../normalize';

/**
 * Regex to match "Family" or "Household" at the end
 */
const FAMILY_WORD_END_RE = /\b(family|household)\s*$/i;

/**
 * Regex to detect family word anywhere
 */
const FAMILY_WORD_RE = /\b(family|household)\b/i;

export interface FamilyDetectionResult {
  isFamily: boolean;
  confidence: Confidence;
  reasons: ReasonCode[];
  entity?: Omit<FamilyName, 'meta'>;
}

/**
 * Check if text has given-name tokens that suggest it's not a family
 * (e.g., "John Smith Family" should still be family, but "John Smith" is person)
 */
function hasGivenNameTokens(text: string): boolean {
  const tokens = tokenize(text);
  // If there are multiple name-like tokens before a family word or at the end,
  // it might indicate given names
  const familyWordIdx = tokens.findIndex(t => /^(family|household)$/i.test(t));

  if (familyWordIdx > 0) {
    // Check tokens before "Family"
    const beforeFamily = tokens.slice(0, familyWordIdx);
    // If more than one token and they all look like names, could be given names
    // But "Smith Family" is still valid (1 token)
    // "The Smith Family" after stripping "The" is still valid
    return beforeFamily.length > 2 && beforeFamily.every(isNameLikeToken);
  }

  return false;
}

/**
 * Detect if input is a family/household name
 */
export function detectFamily(normalized: string): FamilyDetectionResult {
  const reasons: ReasonCode[] = [];
  let confidence: Confidence = 0.5;
  let kind: 'family' | 'household' = 'family';
  let style: FamilyStyle = 'familyWord';
  let familyName: string = normalized;
  let article: 'The' | undefined;
  let familyWord: 'Family' | 'Household' | undefined;

  // Check if starts with "The"
  const hasThe = startsWithThe(normalized);
  if (hasThe) {
    reasons.push('FAMILY_STARTS_WITH_THE');
    article = 'The';
  }

  // Remove "The" for further processing
  const withoutThe = hasThe ? stripLeadingThe(normalized) : normalized;

  // Check for "Family" or "Household" at the end (strongest signal)
  const familyWordMatch = withoutThe.match(FAMILY_WORD_END_RE);
  if (familyWordMatch) {
    reasons.push('FAMILY_ENDS_WITH_FAMILY');
    reasons.push('FAMILY_HAS_FAMILY_WORD');
    confidence = 1;

    const word = familyWordMatch[1].toLowerCase();
    kind = word === 'household' ? 'household' : 'family';
    familyWord = word === 'household' ? 'Household' : 'Family';
    style = 'familyWord';

    // Extract the surname (everything before "Family"/"Household")
    familyName = withoutThe.slice(0, familyWordMatch.index).trim();

    // Check if it looks like there are given names (reduce confidence)
    if (hasGivenNameTokens(withoutThe)) {
      confidence = 0.75;
    }

    return {
      isFamily: true,
      confidence,
      reasons,
      entity: {
        kind,
        article,
        familyName,
        style,
        familyWord,
      },
    };
  }

  // Check for plural surname pattern (The Smiths, The Joneses)
  if (hasThe && hasPluralSurnameEnding(withoutThe)) {
    reasons.push('FAMILY_PLURAL_SURNAME');
    style = 'pluralSurname';

    // Keep the plural form as-is to avoid incorrectly singularizing
    // surnames that naturally end in 's' (Hicks, Williams, Adams, etc.)
    familyName = withoutThe.trim();

    // This is medium confidence (could be a band, etc.)
    confidence = 0.75;

    // Add ambiguity warning for "The Xs" pattern without "Family" word
    if (!FAMILY_WORD_RE.test(normalized)) {
      reasons.push('AMBIGUOUS_THE_PLURAL');
      confidence = 0.5;
    }

    return {
      isFamily: true,
      confidence,
      reasons,
      entity: {
        kind,
        article,
        familyName,
        style,
      },
    };
  }

  // If we have "The" but no family word or plural, it's ambiguous
  if (hasThe) {
    // Could be "The Cure" (band), "The Rock" (person), etc.
    // Don't classify as family without stronger signals
    return { isFamily: false, confidence: 0, reasons: [] };
  }

  // No family signals
  return { isFamily: false, confidence: 0, reasons: [] };
}

/**
 * Build a complete FamilyName entity
 */
export function buildFamilyEntity(
  result: FamilyDetectionResult,
  raw: string,
  normalized: string,
  locale: string = 'en'
): FamilyName {
  const meta: ParseMeta = {
    raw,
    normalized,
    confidence: result.confidence,
    reasons: result.reasons,
    locale,
  };

  return {
    kind: result.entity?.kind || 'family',
    article: result.entity?.article,
    familyName: result.entity?.familyName || normalized,
    style: result.entity?.style || 'familyWord',
    familyWord: result.entity?.familyWord,
    meta,
  };
}
