/**
 * Institution phrases and patterns for organization detection
 */

import type { LegalForm } from '../types';

export interface InstitutionPhrase {
  pattern: RegExp;
  legalForm: LegalForm;
  /** Whether this is a strong signal */
  strong: boolean;
}

/**
 * Institution phrase patterns
 * These are checked against the full normalized string
 */
export const INSTITUTION_PHRASES: readonly InstitutionPhrase[] = [
  // Banking/Financial (strong)
  { pattern: /\bbank\s+of\b/i, legalForm: 'Bank', strong: true },
  { pattern: /\bfirst\s+national\s+bank\b/i, legalForm: 'Bank', strong: true },
  { pattern: /\btrust\s+company\b/i, legalForm: 'TrustCompany', strong: true },
  { pattern: /\bcredit\s+union\b/i, legalForm: 'CreditUnion', strong: true },
  { pattern: /\bsavings\s+(?:and\s+)?loan\b/i, legalForm: 'Bank', strong: true },
  { pattern: /\b(?:national|federal)\s+bank\b/i, legalForm: 'Bank', strong: true },

  // Educational (strong)
  { pattern: /\buniversity\s+of\b/i, legalForm: 'University', strong: true },
  { pattern: /\buniversity$/i, legalForm: 'University', strong: true },
  { pattern: /\bcollege\s+of\b/i, legalForm: 'University', strong: true },
  { pattern: /\binstitute\s+of\b/i, legalForm: 'University', strong: true },

  // Healthcare (strong)
  { pattern: /\bhospital\b/i, legalForm: 'Hospital', strong: true },
  { pattern: /\bmedical\s+center\b/i, legalForm: 'Hospital', strong: true },
  { pattern: /\bclinic\b/i, legalForm: 'Hospital', strong: false },

  // Religious (strong)
  { pattern: /\bchurch\s+of\b/i, legalForm: 'Church', strong: true },
  { pattern: /\bchurch$/i, legalForm: 'Church', strong: true },
  { pattern: /\bministry\b/i, legalForm: 'Church', strong: true },
  { pattern: /\bsynagogue\b/i, legalForm: 'Church', strong: true },
  { pattern: /\bmosque\b/i, legalForm: 'Church', strong: true },
  { pattern: /\btemple\b/i, legalForm: 'Church', strong: false },

  // Government (strong)
  { pattern: /\bcity\s+of\b/i, legalForm: 'Government', strong: true },
  { pattern: /\bcounty\s+of\b/i, legalForm: 'Government', strong: true },
  { pattern: /\bstate\s+of\b/i, legalForm: 'Government', strong: true },
  { pattern: /\bdepartment\s+of\b/i, legalForm: 'Government', strong: true },
  { pattern: /\bgovernment\s+of\b/i, legalForm: 'Government', strong: true },
  { pattern: /\boffice\s+of\b/i, legalForm: 'Government', strong: false },
];

/**
 * Weak organization keywords (need additional context)
 */
export const ORG_WEAK_KEYWORDS_RE = /\b(bank|trust|holdings|partners|group|company|co\.|associates|enterprises|services|solutions|consulting)\b/i;

/**
 * d/b/a (doing business as) pattern
 */
export const DBA_RE = /\b(d\/b\/a|doing\s+business\s+as|dba|aka|a\/k\/a)\b/i;

/**
 * c/o (care of) pattern
 */
export const CARE_OF_RE = /\b(c\/o|care\s+of|attn:?|attention:?)\b/i;

/**
 * Check if text matches an institution phrase
 */
export function matchInstitutionPhrase(text: string): InstitutionPhrase | null {
  for (const phrase of INSTITUTION_PHRASES) {
    if (phrase.pattern.test(text)) {
      return phrase;
    }
  }
  return null;
}

/**
 * Check if text has weak organization keywords
 */
export function hasWeakOrgKeyword(text: string): boolean {
  return ORG_WEAK_KEYWORDS_RE.test(text);
}

/**
 * Check if text has d/b/a pattern
 */
export function hasDbaPattern(text: string): boolean {
  return DBA_RE.test(text);
}

/**
 * Check if text has c/o pattern
 */
export function hasCareOfPattern(text: string): boolean {
  return CARE_OF_RE.test(text);
}

/**
 * Extract d/b/a alternate name if present
 */
export function extractDba(text: string): { primary: string; aka: string } | null {
  const match = text.match(DBA_RE);
  if (!match) return null;

  const idx = match.index!;
  const primary = text.slice(0, idx).trim();
  const aka = text.slice(idx + match[0].length).trim();

  if (primary && aka) {
    return { primary, aka };
  }
  return null;
}
