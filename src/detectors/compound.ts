/**
 * Compound name detection module (multi-person in one field)
 *
 * Handles patterns like:
 * - "Bob & Mary Smith" (shared surname)
 * - "Mr. & Mrs. Smith" (paired honorifics)
 * - "Dr. Bill and Mrs. Mary Smith" (mixed honorifics)
 * - "Drs. John and Jane Doe" (plural honorific)
 * - "Bill & Dr. Mary Smith" (honorific on second person)
 * - "Smith, Bill & Mary" (reversed format)
 */

import type { CompoundName, CompoundConnector, PersonName, UnknownName, ReasonCode, Confidence, ParseMeta } from '../types';
import { tokenize, isNameLikeToken } from '../normalize';

/**
 * Extended compound connectors (beyond basic types)
 */
export type ExtendedConnector = CompoundConnector | ';' | '|' | '/';

/**
 * Regex to match compound connectors
 * Supports: &, and, +, et, ;, |, /
 * Note: / only treated as connector when surrounded by spaces
 */
const COMPOUND_CONNECTOR_RE = /(?:^|\s)(&|and|\+|et|;|\|)(?:\s|$)|(?:\s)(\/)\s/i;

/**
 * Paired honorific patterns that indicate a compound name
 * Format: [firstHonorific, secondHonorific]
 */
const PAIRED_HONORIFIC_PATTERNS: Array<{ pattern: RegExp; first: string; second: string }> = [
  { pattern: /^mr\.?\s*[&+]\s*mrs\.?/i, first: 'Mr.', second: 'Mrs.' },
  { pattern: /^mr\.?\s+and\s+mrs\.?/i, first: 'Mr.', second: 'Mrs.' },
  { pattern: /^mr\.?\s*[&+]\s*ms\.?/i, first: 'Mr.', second: 'Ms.' },
  { pattern: /^mr\.?\s+and\s+ms\.?/i, first: 'Mr.', second: 'Ms.' },
  { pattern: /^mr\.?\s*[&+]\s*mr\.?/i, first: 'Mr.', second: 'Mr.' },
  { pattern: /^mr\.?\s+and\s+mr\.?/i, first: 'Mr.', second: 'Mr.' },
  { pattern: /^mrs\.?\s*[&+]\s*mrs\.?/i, first: 'Mrs.', second: 'Mrs.' },
  { pattern: /^mrs\.?\s+and\s+mrs\.?/i, first: 'Mrs.', second: 'Mrs.' },
  { pattern: /^ms\.?\s*[&+]\s*ms\.?/i, first: 'Ms.', second: 'Ms.' },
  { pattern: /^ms\.?\s+and\s+ms\.?/i, first: 'Ms.', second: 'Ms.' },
  { pattern: /^dr\.?\s*[&+]\s*mrs\.?/i, first: 'Dr.', second: 'Mrs.' },
  { pattern: /^dr\.?\s+and\s+mrs\.?/i, first: 'Dr.', second: 'Mrs.' },
  { pattern: /^dr\.?\s*[&+]\s*mr\.?/i, first: 'Dr.', second: 'Mr.' },
  { pattern: /^dr\.?\s+and\s+mr\.?/i, first: 'Dr.', second: 'Mr.' },
  { pattern: /^dr\.?\s*[&+]\s*ms\.?/i, first: 'Dr.', second: 'Ms.' },
  { pattern: /^dr\.?\s+and\s+ms\.?/i, first: 'Dr.', second: 'Ms.' },
  { pattern: /^dr\.?\s*[&+]\s*dr\.?/i, first: 'Dr.', second: 'Dr.' },
  { pattern: /^dr\.?\s+and\s+dr\.?/i, first: 'Dr.', second: 'Dr.' },
];

/**
 * Plural honorifics and their singular equivalents
 */
const PLURAL_HONORIFICS: Record<string, string> = {
  'drs': 'Dr.',
  'drs.': 'Dr.',
  'doctors': 'Dr.',
  'messrs': 'Mr.',
  'messrs.': 'Mr.',
  'messieurs': 'Mr.',
  'mmes': 'Mrs.',
  'mmes.': 'Mrs.',
  'mesdames': 'Mrs.',
  'profs': 'Prof.',
  'profs.': 'Prof.',
  'professors': 'Prof.',
  'revs': 'Rev.',
  'revs.': 'Rev.',
  'reverends': 'Rev.',
};

/**
 * Single honorific pattern for member parsing
 */
const SINGLE_HONORIFIC_RE = /^(mr|mrs|ms|miss|mx|dr|prof|sir|dame|rev|fr|rabbi|imam|pastor|judge|justice|capt|maj|col|gen|adm|sgt|lt)(?:\.\s*|\s+|$)/i;

/**
 * Known suffixes that should NOT be inherited across members
 */
const SUFFIX_SET = new Set([
  'jr', 'jr.', 'sr', 'sr.',
  'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
  'phd', 'ph.d.', 'ph.d', 'md', 'm.d.',
  'dds', 'd.d.s.', 'dmd', 'd.m.d.',
  'esq', 'esq.', 'jd', 'j.d.',
  'mba', 'm.b.a.', 'cpa', 'cfa',
  'rn', 'np', 'pa-c',
  'obe', 'mbe', 'cbe', 'kbe', 'dbe',
]);

/**
 * Check if a token is a known suffix/credential
 */
function isSuffixToken(token: string): boolean {
  return SUFFIX_SET.has(token.toLowerCase().replace(/\.$/, ''));
}

/**
 * Map connector text to type
 */
function getConnectorType(connector: string): CompoundConnector {
  const lower = connector.toLowerCase().trim();
  if (lower === '&') return '&';
  if (lower === 'and') return 'and';
  if (lower === '+') return '+';
  if (lower === 'et') return 'et';
  // Extended connectors map to 'unknown' for now
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
  /** For paired honorific patterns */
  pairedHonorifics?: { first: string; second: string };
  /** For plural honorific patterns */
  pluralHonorific?: string;
  /** Singular form of plural honorific */
  singularHonorific?: string;
}

/**
 * Check for paired honorific pattern at start (Mr. & Mrs., etc.)
 */
function detectPairedHonorifics(text: string): { pattern: RegExp; first: string; second: string } | null {
  for (const pair of PAIRED_HONORIFIC_PATTERNS) {
    if (pair.pattern.test(text)) {
      return pair;
    }
  }
  return null;
}

/**
 * Check for plural honorific at start (Drs., Messrs., etc.)
 */
function detectPluralHonorific(text: string): { plural: string; singular: string; remainder: string } | null {
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;

  const firstToken = tokens[0].toLowerCase();
  const singular = PLURAL_HONORIFICS[firstToken];

  if (singular) {
    const remainder = tokens.slice(1).join(' ');
    return { plural: tokens[0], singular, remainder };
  }
  return null;
}

/**
 * Parse a single member, extracting honorific and suffix
 */
interface ParsedMember {
  honorific?: string;
  given?: string;
  middle?: string;
  family?: string;
  suffix?: string;
  raw: string;
}

function parseMemberTokens(text: string): ParsedMember {
  let workingText = text.trim();
  let honorific: string | undefined;
  let suffix: string | undefined;

  // Extract leading honorific
  const honorificMatch = workingText.match(SINGLE_HONORIFIC_RE);
  if (honorificMatch) {
    honorific = honorificMatch[0].trim();
    workingText = workingText.slice(honorificMatch[0].length).trim();
  }

  // Extract trailing suffix (comma-separated or space-separated known suffixes)
  const commaIdx = workingText.lastIndexOf(',');
  if (commaIdx > 0) {
    const afterComma = workingText.slice(commaIdx + 1).trim();
    const suffixTokens = tokenize(afterComma);
    if (suffixTokens.length > 0 && isSuffixToken(suffixTokens[0])) {
      suffix = afterComma;
      workingText = workingText.slice(0, commaIdx).trim();
    }
  }

  // Also check for space-separated suffix at end
  const tokens = tokenize(workingText);
  while (tokens.length > 1 && isSuffixToken(tokens[tokens.length - 1])) {
    const suffixToken = tokens.pop()!;
    suffix = suffix ? `${suffixToken}, ${suffix}` : suffixToken;
  }
  workingText = tokens.join(' ');

  // Now parse remaining tokens as given/middle/family
  const nameTokens = tokenize(workingText);
  let given: string | undefined;
  let middle: string | undefined;
  let family: string | undefined;

  if (nameTokens.length === 0) {
    // No name tokens
  } else if (nameTokens.length === 1) {
    given = nameTokens[0];
  } else {
    given = nameTokens[0];
    family = nameTokens[nameTokens.length - 1];
    if (nameTokens.length > 2) {
      middle = nameTokens.slice(1, -1).join(' ');
    }
  }

  return { honorific, given, middle, family, suffix, raw: text };
}

/**
 * Detect if input is a compound name (multiple people)
 */
export function detectCompound(normalized: string): CompoundDetectionResult {
  const reasons: ReasonCode[] = [];

  // First check for paired honorific patterns (Mr. & Mrs., Dr. and Mrs., etc.)
  const pairedMatch = detectPairedHonorifics(normalized);
  if (pairedMatch) {
    // Extract remainder after paired honorifics
    const remainder = normalized.replace(pairedMatch.pattern, '').trim();
    const tokens = tokenize(remainder);

    reasons.push('COMPOUND_CONNECTOR');
    reasons.push('COMPOUND_PAIRED_HONORIFIC');

    // Handle "Mr. & Mrs. Smith" (just surname)
    if (tokens.length === 1 && isNameLikeToken(tokens[0])) {
      reasons.push('COMPOUND_SHARED_FAMILY');
      return {
        isCompound: true,
        confidence: 0.75,
        reasons,
        connector: '&',
        leftPart: pairedMatch.first,
        rightPart: pairedMatch.second,
        sharedFamily: tokens[0],
        pairedHonorifics: { first: pairedMatch.first, second: pairedMatch.second },
      };
    }

    // Handle "Mr. & Mrs. Bill Smith" (given + surname, given belongs to first person)
    if (tokens.length === 2 && isNameLikeToken(tokens[0]) && isNameLikeToken(tokens[1])) {
      reasons.push('COMPOUND_SHARED_FAMILY');
      return {
        isCompound: true,
        confidence: 1,
        reasons,
        connector: '&',
        leftPart: `${pairedMatch.first} ${tokens[0]}`,
        rightPart: pairedMatch.second,
        sharedFamily: tokens[1],
        pairedHonorifics: { first: pairedMatch.first, second: pairedMatch.second },
      };
    }

    // Handle "Mr. & Mrs. Bill and Mary Smith" or similar - find connector in remainder
    const innerConnectorMatch = remainder.match(COMPOUND_CONNECTOR_RE);
    if (innerConnectorMatch) {
      const connectorIdx = innerConnectorMatch.index!;
      const fullMatch = innerConnectorMatch[0];
      const connector = innerConnectorMatch[1] || innerConnectorMatch[2];

      const leftName = remainder.slice(0, connectorIdx).trim();
      const rightName = remainder.slice(connectorIdx + fullMatch.length).trim();

      if (leftName && rightName) {
        // Infer shared family from right side
        const rightTokens = tokenize(rightName);
        let sharedFamily: string | undefined;
        if (rightTokens.length >= 2) {
          const lastToken = rightTokens[rightTokens.length - 1];
          if (isNameLikeToken(lastToken) && !isSuffixToken(lastToken)) {
            sharedFamily = lastToken;
            reasons.push('COMPOUND_SHARED_FAMILY');
          }
        }

        return {
          isCompound: true,
          confidence: sharedFamily ? 1 : 0.75,
          reasons,
          connector: getConnectorType(connector),
          leftPart: `${pairedMatch.first} ${leftName}`.trim(),
          rightPart: `${pairedMatch.second} ${rightName}`.trim(),
          sharedFamily,
          pairedHonorifics: { first: pairedMatch.first, second: pairedMatch.second },
        };
      }
    }

    // Fallback: treat remainder as shared surname
    if (remainder) {
      reasons.push('COMPOUND_SHARED_FAMILY');
      return {
        isCompound: true,
        confidence: 0.75,
        reasons,
        connector: '&',
        leftPart: pairedMatch.first,
        rightPart: pairedMatch.second,
        sharedFamily: remainder,
        pairedHonorifics: { first: pairedMatch.first, second: pairedMatch.second },
      };
    }
  }

  // Check for plural honorific (Drs. John and Jane Doe)
  const pluralMatch = detectPluralHonorific(normalized);
  if (pluralMatch) {
    // Look for connector in remainder
    const connectorMatch = pluralMatch.remainder.match(COMPOUND_CONNECTOR_RE);
    if (connectorMatch) {
      const connectorIdx = connectorMatch.index!;
      const fullMatch = connectorMatch[0];
      const connector = connectorMatch[1] || connectorMatch[2];

      const leftName = pluralMatch.remainder.slice(0, connectorIdx).trim();
      const rightName = pluralMatch.remainder.slice(connectorIdx + fullMatch.length).trim();

      if (leftName && rightName) {
        reasons.push('COMPOUND_CONNECTOR');
        reasons.push('COMPOUND_PLURAL_HONORIFIC');

        // Both get the singular honorific
        const leftPart = `${pluralMatch.singular} ${leftName}`.trim();
        const rightPart = `${pluralMatch.singular} ${rightName}`.trim();

        // Infer shared family
        const rightTokens = tokenize(rightName);
        let sharedFamily: string | undefined;
        if (rightTokens.length >= 2) {
          const lastToken = rightTokens[rightTokens.length - 1];
          if (isNameLikeToken(lastToken) && !isSuffixToken(lastToken)) {
            sharedFamily = lastToken;
            reasons.push('COMPOUND_SHARED_FAMILY');
          }
        }

        return {
          isCompound: true,
          confidence: sharedFamily ? 1 : 0.75,
          reasons,
          connector: getConnectorType(connector),
          leftPart,
          rightPart,
          sharedFamily,
          pluralHonorific: pluralMatch.plural,
          singularHonorific: pluralMatch.singular,
        };
      }
    }
  }

  // Standard connector detection
  const connectorMatch = normalized.match(COMPOUND_CONNECTOR_RE);
  if (!connectorMatch) {
    return { isCompound: false, confidence: 0, reasons: [] };
  }

  const connectorIdx = connectorMatch.index!;
  const fullMatch = connectorMatch[0];
  const connector = connectorMatch[1] || connectorMatch[2]; // handle / in capture group 2
  const connectorType = getConnectorType(connector);

  // Split into left and right parts
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
  // But we need to exclude suffixes from consideration
  if (rightTokens.length >= 2) {
    // Find the last non-suffix token
    let familyIdx = rightTokens.length - 1;
    while (familyIdx >= 0 && isSuffixToken(rightTokens[familyIdx])) {
      familyIdx--;
    }

    if (familyIdx >= 1) { // Need at least a given name before the family
      const potentialShared = rightTokens[familyIdx];
      if (isNameLikeToken(potentialShared)) {
        // Check if left side looks like it needs a family name
        // (single name, or ends with honorific/given name pattern)
        const leftParsed = parseMemberTokens(leftPart);
        if (!leftParsed.family || leftParsed.given === leftParsed.family) {
          sharedFamily = potentialShared;
          reasons.push('COMPOUND_SHARED_FAMILY');
          confidence = 1;
        }
      }
    }
  }

  // Also handle: "Mr. & Mrs. Smith" pattern (already handled above, but also simple version)
  if (!sharedFamily && rightTokens.length === 1 && isNameLikeToken(rightTokens[0])) {
    // If left looks like title(s) and right is just a surname
    const leftLower = leftPart.toLowerCase();
    if (/^(mr|mrs|ms|dr|rev)\.?\s*/i.test(leftLower)) {
      sharedFamily = rightTokens[0];
      reasons.push('COMPOUND_SHARED_FAMILY');
      confidence = 0.75;
    }
  }

  // Handle reversed format: "Smith, Bill & Mary"
  if (!sharedFamily && leftPart.includes(',')) {
    const commaParts = leftPart.split(',').map(p => p.trim());
    if (commaParts.length >= 2 && isNameLikeToken(commaParts[0])) {
      // First part before comma is likely the shared family name
      sharedFamily = commaParts[0];
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
 */
function parseCompoundMember(
  text: string,
  raw: string,
  sharedFamily?: string,
  inheritedHonorific?: string,
  locale: string = 'en'
): PersonName | UnknownName {
  const meta: ParseMeta = {
    raw,
    normalized: text,
    confidence: 0.5,
    reasons: [],
    locale,
  };

  if (!text.trim()) {
    return {
      kind: 'unknown',
      text,
      meta,
    };
  }

  const parsed = parseMemberTokens(text);

  // Use inherited honorific if none extracted
  const honorific = parsed.honorific || inheritedHonorific;

  // Determine family name
  let family = parsed.family;
  if (!family && sharedFamily) {
    family = sharedFamily;
  }

  // If we have both given and family from parsing, and shared family was provided,
  // the parsed family might actually be the shared one - check if they match
  if (parsed.family && sharedFamily && parsed.family.toLowerCase() === sharedFamily.toLowerCase()) {
    // Good, family matches shared
  } else if (parsed.family && sharedFamily) {
    // Parsed family differs from shared - use parsed family
    family = parsed.family;
  }

  return {
    kind: 'person',
    honorific,
    given: parsed.given,
    middle: parsed.middle,
    family,
    suffix: parsed.suffix,
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
    // For paired honorifics, check if leftPart IS the honorific itself
    const inheritedHonorific = result.pairedHonorifics?.first || result.singularHonorific;
    const leftText = result.leftPart;

    // Check if leftPart IS just the honorific (e.g., "Mr." from "Mr. & Mrs. Smith")
    const isJustHonorific = inheritedHonorific &&
      leftText.toLowerCase().replace(/\./g, '') === inheritedHonorific.toLowerCase().replace(/\./g, '');

    // Check if leftPart already starts with an honorific followed by name
    const hasOwnHonorific = SINGLE_HONORIFIC_RE.test(leftText);

    if (isJustHonorific) {
      // leftPart is just the honorific, create member with only honorific and shared family
      members.push({
        kind: 'person',
        honorific: inheritedHonorific,
        family: result.sharedFamily,
        meta: {
          raw: leftText,
          normalized: leftText,
          confidence: 0.5,
          reasons: [],
          locale,
        },
      });
    } else {
      members.push(parseCompoundMember(
        leftText,
        leftText,
        result.sharedFamily,
        hasOwnHonorific ? undefined : inheritedHonorific,
        locale
      ));
    }
  }

  if (result.rightPart) {
    // For right part with shared family, don't duplicate the family name
    let rightText = result.rightPart;

    // Remove shared family from the end if present
    if (result.sharedFamily) {
      const familyRegex = new RegExp(`\\s+${escapeRegex(result.sharedFamily)}\\s*$`, 'i');
      rightText = rightText.replace(familyRegex, '').trim() || result.rightPart;
    }

    // For paired honorifics, inherit second honorific if not already present
    const inheritedHonorific = result.pairedHonorifics?.second || result.singularHonorific;

    // Check if rightText IS just the honorific (e.g., "Mrs." from "Mr. & Mrs. Smith")
    const isJustHonorific = inheritedHonorific &&
      rightText.toLowerCase().replace(/\./g, '') === inheritedHonorific.toLowerCase().replace(/\./g, '');

    // Check if rightText already starts with an honorific followed by name
    const hasOwnHonorific = SINGLE_HONORIFIC_RE.test(rightText);

    if (isJustHonorific) {
      // rightText is just the honorific, create member with only honorific and shared family
      members.push({
        kind: 'person',
        honorific: inheritedHonorific,
        family: result.sharedFamily,
        meta: {
          raw: result.rightPart,
          normalized: rightText,
          confidence: 0.5,
          reasons: [],
          locale,
        },
      });
    } else {
      members.push(parseCompoundMember(
        rightText || result.rightPart,
        result.rightPart,
        result.sharedFamily,
        hasOwnHonorific ? undefined : inheritedHonorific,
        locale
      ));
    }
  }

  return {
    kind: 'compound',
    connector: result.connector || 'unknown',
    members,
    sharedFamily: result.sharedFamily,
    meta,
  };
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
