/**
 * Compound name detection module (multi-person in one field)
 */

import type { CompoundName, CompoundConnector, PersonName, UnknownName, ReasonCode, Confidence, ParseMeta } from '../types';
import { tokenize, isNameLikeToken } from '../normalize';

/**
 * Regex to match compound connectors
 * Note: Can't use \b for & and + since they're not word characters
 * Use space/boundary lookaround instead
 */
const COMPOUND_CONNECTOR_RE = /(?:^|\s)(&|and|\+|et)(?:\s|$)/i;

/**
 * Map connector text to type
 */
function getConnectorType(connector: string): CompoundConnector {
  const lower = connector.toLowerCase().trim();
  if (lower === '&') return '&';
  if (lower === 'and') return 'and';
  if (lower === '+') return '+';
  if (lower === 'et') return 'et';
  return 'unknown';
}

export interface CompoundDetectionResult {
  isCompound: boolean;
  confidence: Confidence;
  reasons: ReasonCode[];
  connector?: CompoundConnector;
  leftPart?: string;
  rightPart?: string;
  sharedFamily?: string;
}

/**
 * Detect if input is a compound name (multiple people)
 */
export function detectCompound(normalized: string): CompoundDetectionResult {
  const reasons: ReasonCode[] = [];

  // Find the connector
  const connectorMatch = normalized.match(COMPOUND_CONNECTOR_RE);
  if (!connectorMatch) {
    return { isCompound: false, confidence: 0, reasons: [] };
  }

  const connectorIdx = connectorMatch.index!;
  const fullMatch = connectorMatch[0]; // includes surrounding whitespace
  const connector = connectorMatch[1]; // just the connector itself
  const connectorType = getConnectorType(connector);

  // Split into left and right parts (account for whitespace in regex match)
  const leftPart = normalized.slice(0, connectorIdx).trim();
  const rightPart = normalized.slice(connectorIdx + fullMatch.length).trim();

  // Both sides must have content
  if (!leftPart || !rightPart) {
    return { isCompound: false, confidence: 0, reasons: [] };
  }

  // Tokenize both sides
  const leftTokens = tokenize(leftPart);
  const rightTokens = tokenize(rightPart);

  // At least one name-like token on each side
  const leftHasName = leftTokens.some(isNameLikeToken);
  const rightHasName = rightTokens.some(isNameLikeToken);

  if (!leftHasName || !rightHasName) {
    return { isCompound: false, confidence: 0, reasons: [] };
  }

  reasons.push('COMPOUND_CONNECTOR');

  // Determine confidence
  let confidence: Confidence = 0.5;

  // Higher confidence if both sides look like proper names
  if (leftHasName && rightHasName) {
    confidence = 0.75;
  }

  // Try to detect shared family name
  // Pattern: "Bob & Mary Smith" -> shared family = "Smith"
  let sharedFamily: string | undefined;

  // If right side has multiple tokens, the last one might be shared
  if (rightTokens.length >= 2) {
    const potentialShared = rightTokens[rightTokens.length - 1];
    // Check if it looks like a surname (capitalized)
    if (isNameLikeToken(potentialShared)) {
      // Left side should not end with a family name (single given name)
      if (leftTokens.length === 1 || !isNameLikeToken(leftTokens[leftTokens.length - 1])) {
        sharedFamily = potentialShared;
        reasons.push('COMPOUND_SHARED_FAMILY');
        confidence = 1;
      }
    }
  }

  // Also handle: "Mr. & Mrs. Smith" pattern
  if (!sharedFamily && rightTokens.length === 1 && isNameLikeToken(rightTokens[0])) {
    // If left looks like title(s) and right is just a surname
    const leftLower = leftPart.toLowerCase();
    if (/^(mr|mrs|ms|dr|rev)\.?\s*/i.test(leftLower)) {
      sharedFamily = rightTokens[0];
      reasons.push('COMPOUND_SHARED_FAMILY');
      confidence = 0.75;
    }
  }

  return {
    isCompound: true,
    confidence,
    reasons,
    connector: connectorType,
    leftPart,
    rightPart,
    sharedFamily,
  };
}

/**
 * Parse a compound member into a basic person or unknown entity
 * (Simplified parsing - full person parsing happens in the main classifier)
 */
function parseCompoundMember(
  text: string,
  raw: string,
  sharedFamily?: string,
  locale: string = 'en'
): PersonName | UnknownName {
  const tokens = tokenize(text);
  const meta: ParseMeta = {
    raw,
    normalized: text,
    confidence: 0.5,
    reasons: [],
    locale,
  };

  if (tokens.length === 0) {
    return {
      kind: 'unknown',
      text,
      meta,
    };
  }

  // Simple heuristic: first token is given, rest is middle, shared family appended
  const given = tokens[0];
  const middle = tokens.length > 1 ? tokens.slice(1).join(' ') : undefined;

  return {
    kind: 'person',
    given,
    middle,
    family: sharedFamily,
    meta,
  };
}

/**
 * Build a complete CompoundName entity
 */
export function buildCompoundEntity(
  result: CompoundDetectionResult,
  raw: string,
  normalized: string,
  locale: string = 'en'
): CompoundName {
  const meta: ParseMeta = {
    raw,
    normalized,
    confidence: result.confidence,
    reasons: result.reasons,
    locale,
  };

  // Parse members
  const members: Array<PersonName | UnknownName> = [];

  if (result.leftPart) {
    members.push(parseCompoundMember(result.leftPart, result.leftPart, result.sharedFamily, locale));
  }

  if (result.rightPart) {
    // For right part with shared family, don't duplicate the family name
    const rightWithoutShared = result.sharedFamily
      ? result.rightPart.replace(new RegExp(`\\s+${result.sharedFamily}\\s*$`, 'i'), '').trim()
      : result.rightPart;

    members.push(parseCompoundMember(rightWithoutShared || result.rightPart, result.rightPart, result.sharedFamily, locale));
  }

  return {
    kind: 'compound',
    connector: result.connector || 'unknown',
    members,
    sharedFamily: result.sharedFamily,
    meta,
  };
}
