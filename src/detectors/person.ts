/**
 * Person detection module with reversed name support
 */

import type {
  PersonName,
  ReasonCode,
  Confidence,
  ParseMeta,
  ParseOptions,
  WarningCode,
  ParseWarning,
  ConfidenceDetail,
  GivenNameEvidenceMatch,
  PersonNameAlternative,
  NameToken,
} from '../types';
import { tokenize, isNameLikeToken, extractParenContent } from '../normalize';
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

function looksLikeUnknownPostNominalChunk(value: string): boolean {
  const v = value.trim().replace(/^[,;:\s]+/, '').replace(/[,;:\s]+$/, '');
  if (!v) return false;
  if (v.length > 18) return false;
  if (/\d/.test(v)) return false;
  if (/[^\p{L}.\-\s]/u.test(v)) return false;
  if (!/[.]/.test(v) && !/[A-Z]/.test(v)) return false;

  const lettersOnly = v
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.\-\s]/g, '');
  if (!/^[A-Za-z]+$/.test(lettersOnly)) return false;
  if (lettersOnly.length < 2 || lettersOnly.length > 10) return false;

  const upperCount = (lettersOnly.match(/[A-Z]/g) ?? []).length;
  if (!/[.]/.test(v) && upperCount / lettersOnly.length < 0.7) return false;

  return true;
}

function looksLikeSuffixChunk(value: string): boolean {
  const firstWord = value.trim().split(/\s+/)[0];
  return isKnownSuffix(firstWord) || looksLikeUnknownPostNominalChunk(value);
}

function looksLikeForwardNameWithCommaSuffix(parts: string[]): boolean {
  if (parts.length !== 2 || !looksLikeSuffixChunk(parts[1])) {
    return false;
  }

  const leftTokens = tokenize(parts[0]);
  return leftTokens.length >= 2 && leftTokens.every(isNameLikeToken);
}

export interface PersonDetectionResult {
  isPerson: boolean;
  confidence: Confidence;
  confidenceDetail?: ConfidenceDetail;
  reasons: ReasonCode[];
  warnings?: string[];
  warningCodes?: WarningCode[];
  warningDetails?: ParseWarning[];
  entity?: Omit<PersonName, 'meta'>;
}

function makeWarning(code: WarningCode, message: string, token?: string, index?: number): ParseWarning {
  return { code, message, token, index };
}

function detailsFromWarnings(warnings: ParseWarning[]): {
  warnings?: string[];
  warningCodes?: WarningCode[];
  warningDetails?: ParseWarning[];
} {
  if (warnings.length === 0) return {};
  return {
    warnings: warnings.map(w => w.message),
    warningCodes: Array.from(new Set(warnings.map(w => w.code))),
    warningDetails: warnings,
  };
}

function collectGivenNameEvidence(
  tokens: string[],
  raw: string,
  options: ParseOptions,
  candidateIndices: number[]
): GivenNameEvidenceMatch[] | undefined {
  if (!options.givenNameEvidence) return undefined;

  const matches: GivenNameEvidenceMatch[] = [];
  candidateIndices.forEach((index) => {
    const token = tokens[index];
    if (!token) return;
    const evidence = options.givenNameEvidence?.(token, { raw, tokens, index });
    if (!evidence) return;
    matches.push({ ...evidence, token, index });
  });

  return matches.length > 0 ? matches : undefined;
}

function evidenceAt(
  evidence: GivenNameEvidenceMatch[] | undefined,
  index: number
): GivenNameEvidenceMatch | undefined {
  return evidence?.find(e => e.index === index);
}

function buildPersonTokens(parts: {
  honorific?: string;
  given?: string;
  additionalGiven?: string;
  family?: string;
  suffix?: string;
  nickname?: string;
  particles?: string[];
}): NameToken[] {
  const tokens: NameToken[] = [];
  if (parts.honorific) tokens.push({ type: 'prefix', value: parts.honorific });
  if (parts.given) tokens.push({ type: 'given', value: parts.given });
  if (parts.additionalGiven) {
    for (const value of parts.additionalGiven.split(/\s+/).filter(Boolean)) {
      tokens.push({ type: 'middle', value });
    }
  }
  if (parts.family) {
    const particleSet = new Set((parts.particles ?? []).map(p => p.toLowerCase()));
    for (const value of parts.family.split(/\s+/).filter(Boolean)) {
      tokens.push({
        type: particleSet.has(value.toLowerCase()) ? 'particle' : 'family',
        value,
      });
    }
  }
  if (parts.suffix) tokens.push({ type: 'suffix', value: parts.suffix });
  if (parts.nickname) tokens.push({ type: 'nickname', value: parts.nickname });
  return tokens;
}

function familyPartsFrom(family: string | undefined): string[] | undefined {
  const parts = family?.split(/\s+/).filter(Boolean);
  return parts && parts.length > 0 ? parts : undefined;
}

function findParticleSurnameStart(tokens: string[]): number | null {
  let start: number | null = null;

  for (let i = tokens.length - 2; i >= 1; i--) {
    if (isParticle(tokens[i])) {
      start = i;
      continue;
    }
    if (start !== null) {
      break;
    }
  }

  return start;
}

/**
 * Try to parse as reversed name format: "Family, Given [Middle] [, Suffix]"
 */
function tryParseReversed(normalized: string, options: ParseOptions = {}): PersonDetectionResult | null {
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

  if (looksLikeForwardNameWithCommaSuffix(parts)) {
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
    if (isKnownSuffix(firstWord) || looksLikeUnknownPostNominalChunk(part)) {
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
  const additionalGiven = middle;
  const tokens = buildPersonTokens({
    given,
    additionalGiven,
    family,
    suffix,
    nickname,
    particles,
  });

  return {
    isPerson: true,
    confidence,
    confidenceDetail: {
      kind: confidence,
      parse: suffix ? 0.98 : 0.9,
      format: 1,
    },
    reasons,
    entity: {
      kind: 'person',
      given,
      fullGiven,
      middle: additionalGiven,
      additionalGiven,
      family,
      familyParts: familyPartsFrom(family),
      suffix,
      nickname,
      particles: particles.length > 0 ? particles : undefined,
      reversed: true,
      tokens,
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
function parseStandardFormat(normalized: string, options: ParseOptions = {}): PersonDetectionResult {
  const reasons: ReasonCode[] = [];
  let confidence: Confidence = 0.5;
  let parseConfidence = 0.55;
  let formatConfidence = 1;
  const parseWarnings: ParseWarning[] = [];

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
    if (isKnownSuffix(firstWord) || looksLikeUnknownPostNominalChunk(afterComma)) {
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
  let additionalGiven: string | undefined;
  let family: string | undefined;
  let alternatives: PersonNameAlternative[] | undefined;
  let givenNameEvidence: GivenNameEvidenceMatch[] | undefined;
  let evidenceUsed = false;

  if (tokens.length === 1) {
    // Single token - treat as given name (could also be family, but we default to given)
    given = tokens[0];
    reasons.push('AMBIGUOUS_SHORT_NAME');
    parseConfidence = 0.45;
  } else {
    given = tokens[0];

    const particleStart = findParticleSurnameStart(tokens);
    if (particleStart !== null) {
      family = tokens.slice(particleStart).join(' ');
      if (particleStart > 1) {
        additionalGiven = tokens.slice(1, particleStart).join(' ');
        middle = additionalGiven;
      }
      parseConfidence = 0.9;
    } else if (tokens.length === 3) {
      const interior = tokens[1];
      const finalToken = tokens[2];
      givenNameEvidence = collectGivenNameEvidence(tokens, normalized, options, [1]);
      const interiorEvidence = evidenceAt(givenNameEvidence, 1);

      alternatives = [
        {
          interpretation: 'given-additional-family',
          given,
          additionalGiven: interior,
          family: finalToken,
          confidence: interiorEvidence?.found ? 0.8 : 0.55,
        },
        {
          interpretation: 'given-compound-family',
          given,
          family: `${interior} ${finalToken}`,
          confidence: interiorEvidence?.found === false ? 0.75 : 0.45,
        },
      ];

      if (interiorEvidence?.found) {
        additionalGiven = interior;
        middle = interior;
        family = finalToken;
        evidenceUsed = true;
        parseConfidence = 0.75;
      } else if (interiorEvidence?.found === false) {
        family = `${interior} ${finalToken}`;
        evidenceUsed = true;
        parseConfidence = 0.7;
        parseWarnings.push(makeWarning(
          'AMBIGUOUS_MIDDLE_OR_FAMILY',
          `Interpreted "${interior}" as possible family-name text because first-name evidence did not find it.`,
          interior,
          1
        ));
        parseWarnings.push(makeWarning(
          'AMBIGUOUS_DOUBLE_SURNAME',
          `The family name may contain both "${interior}" and "${finalToken}".`,
          interior,
          1
        ));
        parseWarnings.push(makeWarning(
          'LOSSY_DISPLAY_RISK',
          'Compact display should preserve this token unless a consumer override confirms it is additional-given text.',
          interior,
          1
        ));
      } else {
        additionalGiven = interior;
        middle = interior;
        family = finalToken;
        parseConfidence = 0.55;
        formatConfidence = 0.85;
        parseWarnings.push(makeWarning(
          'AMBIGUOUS_MIDDLE_OR_FAMILY',
          `Could not determine whether "${interior}" is an additional given name or part of the family name.`,
          interior,
          1
        ));
        parseWarnings.push(makeWarning(
          'AMBIGUOUS_DOUBLE_SURNAME',
          `The name may be interpreted with "${interior} ${finalToken}" as a compound family name.`,
          interior,
          1
        ));
        parseWarnings.push(makeWarning(
          'LOSSY_DISPLAY_RISK',
          'Compact display should preserve this token unless a consumer override confirms it is additional-given text.',
          interior,
          1
        ));
      }
    } else {
      const interiorTokens = tokens.slice(1, -1);
      const interiorIndices = interiorTokens.map((_, offset) => offset + 1);
      givenNameEvidence = collectGivenNameEvidence(tokens, normalized, options, interiorIndices);
      const interiorEvidence = interiorTokens.map((_, offset) => evidenceAt(givenNameEvidence, offset + 1));
      const allInteriorCheckedNotFound =
        interiorEvidence.length > 0 && interiorEvidence.every(e => e?.found === false);

      if (allInteriorCheckedNotFound) {
        family = tokens.slice(1).join(' ');
        evidenceUsed = true;
        parseConfidence = 0.65;
      } else {
        additionalGiven = interiorTokens.join(' ') || undefined;
        middle = additionalGiven;
        family = tokens[tokens.length - 1];
        parseConfidence = tokens.length > 3 ? 0.5 : 0.55;
        formatConfidence = 0.85;
        parseWarnings.push(makeWarning(
          'AMBIGUOUS_MIDDLE_OR_FAMILY',
          'Could not determine whether one or more interior tokens are additional given names or family-name text.',
          interiorTokens.join(' ') || undefined,
          1
        ));
        parseWarnings.push(makeWarning(
          'LOSSY_DISPLAY_RISK',
          'Compact display should preserve ambiguous interior tokens unless a consumer override confirms they are additional-given text.',
          interiorTokens.join(' ') || undefined,
          1
        ));
      }
    }
    confidence = Math.max(confidence, 0.75) as Confidence;
  }

  const particles: string[] = [];
  if (family) {
    const famParticles = extractParticles(family.split(/\s+/));
    for (const p of famParticles) {
      if (!particles.includes(p)) {
        particles.push(p);
      }
    }
  }

  if (evidenceUsed) {
    parseWarnings.push(makeWarning(
      'GIVEN_NAME_EVIDENCE_USED',
      'Optional first-name evidence influenced the selected parse.'
    ));
  }

  const warningData = detailsFromWarnings(parseWarnings);
  const tokensOut = buildPersonTokens({
    honorific,
    given,
    additionalGiven,
    family,
    suffix,
    nickname,
    particles,
  });

  return {
    isPerson: true,
    confidence,
    confidenceDetail: {
      kind: confidence,
      parse: parseConfidence,
      format: formatConfidence,
    },
    reasons,
    ...warningData,
    entity: {
      kind: 'person',
      honorific,
      given,
      fullGiven,
      middle,
      additionalGiven,
      family,
      familyParts: familyPartsFrom(family),
      suffix,
      nickname,
      particles: particles.length > 0 ? particles : undefined,
      reversed: false,
      tokens: tokensOut,
      alternatives,
      givenNameEvidence,
    },
  };
}

/**
 * Detect if input is a person name
 */
export function detectPerson(normalized: string, options: ParseOptions = {}): PersonDetectionResult {
  // First try reversed format
  const reversedResult = tryParseReversed(normalized, options);
  if (reversedResult) {
    return reversedResult;
  }

  // Fall back to standard format
  return parseStandardFormat(normalized, options);
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
    confidenceDetail: result.confidenceDetail,
    reasons: result.reasons,
    warnings: result.warnings,
    warningCodes: result.warningCodes,
    warningDetails: result.warningDetails,
    locale,
  };

  return {
    kind: 'person',
    honorific: result.entity?.honorific,
    given: result.entity?.given,
    fullGiven: result.entity?.fullGiven,
    middle: result.entity?.middle,
    additionalGiven: result.entity?.additionalGiven,
    family: result.entity?.family,
    familyParts: result.entity?.familyParts,
    suffix: result.entity?.suffix,
    nickname: result.entity?.nickname,
    particles: result.entity?.particles,
    reversed: result.entity?.reversed,
    tokens: result.entity?.tokens,
    alternatives: result.entity?.alternatives,
    givenNameEvidence: result.entity?.givenNameEvidence,
    meta,
  };
}
