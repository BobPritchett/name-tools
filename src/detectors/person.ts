/**
 * Person detection module with reversed name support
 */

import type { PersonName, ReasonCode, Confidence, ParseMeta } from '../types';
import { tokenize, isNameLikeToken, extractParenContent, stripParenAnnotation } from '../normalize';
import { isParticle, isMultiWordParticle } from '../data/particles';

/**
 * Known suffixes for reversed name parsing
 */
const SUFFIX_ALLOW_LIST = new Set([
  'jr', 'jr.',
  'sr', 'sr.',
  'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
  'phd', 'ph.d.', 'ph.d',
  'md', 'm.d.',
  'dds', 'd.d.s.',
  'esq', 'esq.',
  'jd', 'j.d.',
  'mba', 'm.b.a.',
  'cpa',
]);

/**
 * Common honorifics/prefixes
 */
const HONORIFIC_RE = /^(mr|mrs|ms|miss|mx|dr|prof|sir|dame|rev|fr|rabbi|imam|pastor|judge|justice|capt|maj|col|gen|adm|sgt|lt)(?:\.\s*|\s+|$)/i;

/**
 * Check if a token is a known suffix
 */
function isKnownSuffix(token: string): boolean {
  return SUFFIX_ALLOW_LIST.has(token.toLowerCase().replace(/\.$/, ''));
}

export interface PersonDetectionResult {
  isPerson: boolean;
  confidence: Confidence;
  reasons: ReasonCode[];
  entity?: Omit<PersonName, 'meta'>;
}

/**
 * Try to parse as reversed name format: "Family, Given [Middle] [, Suffix]"
 */
function tryParseReversed(normalized: string): PersonDetectionResult | null {
  let text = normalized;
  let nickname: string | undefined;

  // Extract nickname from quotes
  const quoteMatch = text.match(/[""']([^""']+)[""']/);
  if (quoteMatch) {
    nickname = quoteMatch[1].trim();
    text = text.replace(quoteMatch[0], ' ').replace(/\s+/g, ' ').trim();
  }
  
  let fullGiven: string | undefined;
  // Extract fullGiven from parentheses
  const parenMatch = text.match(/\s*\(([^)]+)\)\s*/);
  if (parenMatch) {
    fullGiven = parenMatch[1].trim();
    text = text.replace(parenMatch[0], ' ').trim();
  }

  // Split on commas
  const parts = text.split(',').map(p => p.trim()).filter(Boolean);

  // Must have 2-4 comma-separated parts
  if (parts.length < 2 || parts.length > 4) {
    return null;
  }

  const reasons: ReasonCode[] = [];

  // First part should be family name
  const familyPart = parts[0];
  if (!familyPart || !isNameLikeToken(familyPart.split(/\s+/)[0])) {
    return null;
  }

  // Second part should contain given name (and maybe middle)
  const givenPart = parts[1];
  const givenTokens = tokenize(givenPart);
  if (givenTokens.length === 0 || !isNameLikeToken(givenTokens[0])) {
    return null;
  }

  // Check for suffix in remaining parts
  let suffix: string | undefined;
  const remainingParts = parts.slice(2);

  for (const part of remainingParts) {
    const firstWord = part.split(/\s+/)[0];
    if (isKnownSuffix(firstWord)) {
      suffix = suffix ? `${suffix}, ${part}` : part;
      reasons.push('PERSON_HAS_SUFFIX');
    } else {
      // Non-suffix in later comma position - might not be reversed name
      return null;
    }
  }

  reasons.push('PERSON_REVERSED_FORMAT');

  // Parse given/middle from givenPart
  const given = givenTokens[0];
  const middle = givenTokens.length > 1 ? givenTokens.slice(1).join(' ') : undefined;

  // Family might include particles (van, de, etc.)
  const familyTokens = tokenize(familyPart);
  const family = familyPart;
  const particles = extractParticles(familyTokens);

  // Higher confidence if suffix detected
  const confidence: Confidence = suffix ? 1 : 0.75;

  return {
    isPerson: true,
    confidence,
    reasons,
    entity: {
      kind: 'person',
      given,
      fullGiven,
      middle,
      family,
      suffix,
      nickname,
      particles: particles.length > 0 ? particles : undefined,
      reversed: true,
    },
  };
}

/**
 * Extract particle strings from family name tokens
 */
function extractParticles(familyTokens: string[]): string[] {
  const particles: string[] = [];
  // Check for multi-word particles first
  const multiWord = isMultiWordParticle(familyTokens);
  if (multiWord) {
    particles.push(multiWord);
    return particles;
  }
  // Check individual tokens
  for (const token of familyTokens) {
    if (isParticle(token)) {
      particles.push(token);
    } else {
      break; // Particles must be at the start of the family name
    }
  }
  return particles;
}

/**
 * Parse standard (forward) name format
 */
function parseStandardFormat(normalized: string): PersonDetectionResult {
  const reasons: ReasonCode[] = [];
  let confidence: Confidence = 0.5;

  let text = normalized;
  let honorific: string | undefined;
  let nickname: string | undefined;
  let suffix: string | undefined;

  // Extract honorific/prefix
  const honorificMatch = text.match(HONORIFIC_RE);
  if (honorificMatch) {
    honorific = honorificMatch[0].trim();
    text = text.slice(honorificMatch[0].length).trim();
    reasons.push('PERSON_HAS_HONORIFIC');
    confidence = 0.75;
  }

  let fullGiven: string | undefined;

  // Extract parenthetical content (could be full given name or annotation)
  const parenResult = extractParenContent(text);
  if (parenResult) {
    fullGiven = parenResult.paren;
    text = parenResult.main;
    reasons.push('HAS_PAREN_ANNOTATION');
  }

  // Check for quotes: "Robert 'Bob' Smith"
  const quoteMatch = text.match(/[""']([^""']+)[""']/);
  if (quoteMatch) {
    nickname = quoteMatch[1].trim();
    text = text.replace(quoteMatch[0], ' ').replace(/\s+/g, ' ').trim();
  }

  // Check for comma-separated suffix at end
  const commaIdx = text.lastIndexOf(',');
  if (commaIdx > 0) {
    const afterComma = text.slice(commaIdx + 1).trim();
    const firstWord = afterComma.split(/\s+/)[0];
    if (isKnownSuffix(firstWord)) {
      suffix = afterComma;
      text = text.slice(0, commaIdx).trim();
      reasons.push('PERSON_HAS_SUFFIX');
      confidence = Math.max(confidence, 0.75) as Confidence;
    }
  }

  // Also check for space-separated suffix at end
  const tokens = tokenize(text);
  while (tokens.length > 1) {
    const lastToken = tokens[tokens.length - 1];
    if (isKnownSuffix(lastToken)) {
      suffix = suffix ? `${lastToken}, ${suffix}` : lastToken;
      tokens.pop();
      if (!reasons.includes('PERSON_HAS_SUFFIX')) {
        reasons.push('PERSON_HAS_SUFFIX');
      }
    } else {
      break;
    }
  }

  // Now tokens should be: [given, ...middle, family] or just [given] or [family]
  if (tokens.length === 0) {
    return { isPerson: false, confidence: 0, reasons: [] };
  }

  reasons.push('PERSON_STANDARD_FORMAT');

  let given: string | undefined;
  let middle: string | undefined;
  let family: string | undefined;

  if (tokens.length === 1) {
    // Single token - treat as given name (could also be family, but we default to given)
    given = tokens[0];
    reasons.push('AMBIGUOUS_SHORT_NAME');
  } else {
    // First token is given, last token is family, middle are middle names
    given = tokens[0];
    family = tokens[tokens.length - 1];
    if (tokens.length > 2) {
      middle = tokens.slice(1, -1).join(' ');
    }
    confidence = Math.max(confidence, 0.75) as Confidence;
  }

  // Extract particles from middle name tokens (e.g. "Ludwig van Beethoven" has "van" in middle)
  const particles: string[] = [];
  if (middle) {
    const middleTokens = middle.split(/\s+/);
    for (const t of middleTokens) {
      if (isParticle(t)) {
        particles.push(t);
      }
    }
  }
  // Also check family name for particles (e.g. reversed parse put them there)
  if (family) {
    const famParticles = extractParticles(family.split(/\s+/));
    for (const p of famParticles) {
      if (!particles.includes(p)) {
        particles.push(p);
      }
    }
  }

  return {
    isPerson: true,
    confidence,
    reasons,
    entity: {
      kind: 'person',
      honorific,
      given,
      fullGiven,
      middle,
      family,
      suffix,
      nickname,
      particles: particles.length > 0 ? particles : undefined,
      reversed: false,
    },
  };
}

/**
 * Detect if input is a person name
 */
export function detectPerson(normalized: string): PersonDetectionResult {
  // First try reversed format
  const reversedResult = tryParseReversed(normalized);
  if (reversedResult) {
    return reversedResult;
  }

  // Fall back to standard format
  return parseStandardFormat(normalized);
}

/**
 * Build a complete PersonName entity
 */
export function buildPersonEntity(
  result: PersonDetectionResult,
  raw: string,
  normalized: string,
  locale: string = 'en'
): PersonName {
  const meta: ParseMeta = {
    raw,
    normalized,
    confidence: result.confidence,
    reasons: result.reasons,
    locale,
  };

  return {
    kind: 'person',
    honorific: result.entity?.honorific,
    given: result.entity?.given,
    fullGiven: result.entity?.fullGiven,
    middle: result.entity?.middle,
    family: result.entity?.family,
    suffix: result.entity?.suffix,
    nickname: result.entity?.nickname,
    particles: result.entity?.particles,
    reversed: result.entity?.reversed,
    meta,
  };
}
