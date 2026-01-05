/**
 * Main classifier orchestrator
 * Implements the classification priority: Organization > Compound > Family > Person > Unknown
 */

import type {
  ParsedNameEntity,
  ParseOptions,
  UnknownName,
  RejectedName,
  ReasonCode,
  Confidence,
  ParseMeta,
  NameKind,
} from './types';
import { normalizeInput, hasAtSymbol, isAllCaps, extractAngleBrackets } from './normalize';
import { detectOrganization, buildOrganizationEntity } from './detectors/organization';
import { detectCompound, buildCompoundEntity } from './detectors/compound';
import { detectFamily, buildFamilyEntity } from './detectors/family';
import { detectPerson, buildPersonEntity } from './detectors/person';

/**
 * Classify a name string into an entity type
 * Priority order:
 * 1. Organization (legal suffixes, institution phrases override everything)
 * 2. Compound (& / and / + connectors with name-like tokens)
 * 3. Family/Household ("Family" word, "The" + plural surname)
 * 4. Person (standard and reversed formats)
 * 5. Unknown (fallback)
 */
export function classifyName(
  input: string,
  options: ParseOptions = {}
): ParsedNameEntity {
  const raw = input;
  const locale = options.locale ?? 'en';

  // Handle empty input
  if (!input || typeof input !== 'string' || !input.trim()) {
    return buildUnknown('', '', locale, [], 'person');
  }

  // Normalize input
  let normalized = normalizeInput(input);
  const reasons: ReasonCode[] = [];

  // Extract email/angle bracket content if present
  const angleBracketResult = extractAngleBrackets(normalized);
  if (angleBracketResult) {
    // Use the display part for classification
    normalized = angleBracketResult.display || normalized;
    if (hasAtSymbol(angleBracketResult.bracket)) {
      reasons.push('HAS_EMAIL_OR_HANDLE');
    }
  }

  // Check for @ symbol (email handle)
  if (hasAtSymbol(normalized)) {
    reasons.push('HAS_EMAIL_OR_HANDLE');
    return applyStrict(buildUnknown(raw, normalized, locale, reasons), options);
  }

  // Check for all caps
  if (isAllCaps(normalized)) {
    reasons.push('HAS_ALLCAPS');
    // Don't reject, but note it
  }

  // 1. Organization detection (highest priority)
  const orgResult = detectOrganization(normalized, raw);
  if (orgResult.isOrg) {
    const entity = buildOrganizationEntity(orgResult, raw, normalized, locale);
    return applyStrict(entity, options);
  }

  // 2. Compound detection
  const compoundResult = detectCompound(normalized);
  if (compoundResult.isCompound) {
    const entity = buildCompoundEntity(compoundResult, raw, normalized, locale);
    return applyStrict(entity, options);
  }

  // 3. Family/Household detection
  const familyResult = detectFamily(normalized);
  if (familyResult.isFamily) {
    const entity = buildFamilyEntity(familyResult, raw, normalized, locale);
    return applyStrict(entity, options);
  }

  // 4. Person detection
  const personResult = detectPerson(normalized);
  if (personResult.isPerson) {
    const entity = buildPersonEntity(personResult, raw, normalized, locale);
    return applyStrict(entity, options);
  }

  // 5. Unknown fallback
  return applyStrict(buildUnknown(raw, normalized, locale, reasons, guessType(normalized)), options);
}

/**
 * Try to guess what type an unknown string might be
 */
function guessType(text: string): NameKind | undefined {
  // Very short text - might be a person
  if (text.length < 20 && /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(text)) {
    return 'person';
  }

  // Contains organization-like keywords
  if (/\b(corp|company|group|holdings|services|consulting)\b/i.test(text)) {
    return 'organization';
  }

  return undefined;
}

/**
 * Build an unknown entity
 */
function buildUnknown(
  raw: string,
  normalized: string,
  locale: string,
  reasons: ReasonCode[],
  guess?: NameKind
): UnknownName {
  const meta: ParseMeta = {
    raw,
    normalized,
    confidence: 0.25,
    reasons,
    locale,
  };

  return {
    kind: 'unknown',
    text: normalized || raw,
    guess: guess as Exclude<NameKind, 'unknown' | 'rejected'> | undefined,
    meta,
  };
}

/**
 * Apply strict mode if requested
 */
function applyStrict(entity: ParsedNameEntity, options: ParseOptions): ParsedNameEntity {
  if (options.strictKind === 'person' && entity.kind !== 'person') {
    const meta: ParseMeta = {
      ...entity.meta,
      confidence: 1,
      reasons: [...entity.meta.reasons],
    };

    const rejected: RejectedName = {
      kind: 'rejected',
      rejectedAs: entity.kind === 'rejected' ? 'unknown' : (entity.kind as Exclude<NameKind, 'rejected'>),
      meta,
    };

    return rejected;
  }

  return entity;
}

/**
 * Check if an entity is a person
 */
export function isPerson(entity: ParsedNameEntity): entity is import('./types').PersonName {
  return entity.kind === 'person';
}

/**
 * Check if an entity is an organization
 */
export function isOrganization(entity: ParsedNameEntity): entity is import('./types').OrganizationName {
  return entity.kind === 'organization';
}

/**
 * Check if an entity is a family
 */
export function isFamily(entity: ParsedNameEntity): entity is import('./types').FamilyName {
  return entity.kind === 'family' || entity.kind === 'household';
}

/**
 * Check if an entity is a compound
 */
export function isCompound(entity: ParsedNameEntity): entity is import('./types').CompoundName {
  return entity.kind === 'compound';
}

/**
 * Check if an entity is unknown
 */
export function isUnknown(entity: ParsedNameEntity): entity is UnknownName {
  return entity.kind === 'unknown';
}

/**
 * Check if an entity was rejected (strict mode)
 */
export function isRejected(entity: ParsedNameEntity): entity is RejectedName {
  return entity.kind === 'rejected';
}
