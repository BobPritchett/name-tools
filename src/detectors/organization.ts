/**
 * Organization detection module
 */

import type { OrganizationName, ReasonCode, Confidence, ParseMeta } from '../types';
import { hasLegalSuffix, extractLegalSuffix, COMMA_LEGAL_RE } from '../data/legal-forms';
import {
  matchInstitutionPhrase,
  hasWeakOrgKeyword,
  hasDbaPattern,
  hasCareOfPattern,
  extractDba,
} from '../data/institutions';

export interface OrgDetectionResult {
  isOrg: boolean;
  confidence: Confidence;
  reasons: ReasonCode[];
  entity?: Omit<OrganizationName, 'meta'>;
}

/**
 * Detect if input is an organization
 * This is the highest priority classifier - organizations override all other types
 */
export function detectOrganization(normalized: string, raw: string): OrgDetectionResult {
  const reasons: ReasonCode[] = [];
  let confidence: Confidence = 0.5;
  let baseName = normalized;
  let legalSuffixRaw: string | undefined;
  let legalForm: OrganizationName['legalForm'];
  let aka: string[] | undefined;

  // Check for legal suffix (strongest signal)
  const legalSuffixResult = extractLegalSuffix(normalized);
  if (legalSuffixResult) {
    reasons.push('ORG_LEGAL_SUFFIX');
    confidence = 1;
    baseName = legalSuffixResult.baseName;
    legalSuffixRaw = legalSuffixResult.suffix;
    legalForm = legalSuffixResult.legalForm;

    // Check for comma-legal format for extra confidence
    if (COMMA_LEGAL_RE.test(normalized)) {
      reasons.push('ORG_COMMA_LEGAL');
    }
  }

  // Check for institution phrases
  const institutionMatch = matchInstitutionPhrase(normalized);
  if (institutionMatch) {
    reasons.push('ORG_INSTITUTION_PHRASE');
    if (institutionMatch.strong) {
      confidence = Math.max(confidence, 0.75) as Confidence;
    } else {
      confidence = Math.max(confidence, 0.5) as Confidence;
    }
    if (!legalForm) {
      legalForm = institutionMatch.legalForm;
    }
  }

  // Check for d/b/a pattern
  if (hasDbaPattern(normalized)) {
    reasons.push('ORG_DBA');
    confidence = Math.max(confidence, 0.75) as Confidence;

    const dbaResult = extractDba(normalized);
    if (dbaResult) {
      baseName = dbaResult.primary;
      aka = [dbaResult.aka];
    }
  }

  // Check for c/o pattern (weaker signal, but suggests organization context)
  if (hasCareOfPattern(normalized)) {
    reasons.push('ORG_CARE_OF');
    // Don't boost confidence much - c/o can appear with person names too
    if (reasons.length > 1) {
      confidence = Math.max(confidence, 0.5) as Confidence;
    }
  }

  // Check for weak organization keywords (only if we don't have stronger signals)
  if (reasons.length === 0 && hasWeakOrgKeyword(normalized)) {
    reasons.push('ORG_WEAK_KEYWORD');
    confidence = 0.5;
  }

  // Determine if this is an organization
  const isOrg = reasons.some(r =>
    r === 'ORG_LEGAL_SUFFIX' ||
    r === 'ORG_INSTITUTION_PHRASE' ||
    r === 'ORG_DBA'
  );

  if (!isOrg) {
    return { isOrg: false, confidence: 0, reasons: [] };
  }

  return {
    isOrg: true,
    confidence,
    reasons,
    entity: {
      kind: 'organization',
      baseName: baseName || normalized,
      legalForm,
      legalSuffixRaw,
      aka,
    },
  };
}

/**
 * Build a complete OrganizationName entity
 */
export function buildOrganizationEntity(
  result: OrgDetectionResult,
  raw: string,
  normalized: string,
  locale: string = 'en'
): OrganizationName {
  const meta: ParseMeta = {
    raw,
    normalized,
    confidence: result.confidence,
    reasons: result.reasons,
    locale,
  };

  return {
    kind: 'organization',
    baseName: result.entity?.baseName || normalized,
    legalForm: result.entity?.legalForm,
    legalSuffixRaw: result.entity?.legalSuffixRaw,
    aka: result.entity?.aka,
    meta,
  };
}
