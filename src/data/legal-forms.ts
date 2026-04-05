/**
 * Legal form suffixes and patterns for organization detection
 */

import type { LegalForm } from '../types';

export interface LegalFormEntry {
  id: LegalForm;
  patterns: string[];
  /** Whether this is a strong signal (high confidence) */
  strong: boolean;
}

/**
 * Legal form entries with their patterns
 * Patterns are normalized (uppercase, periods removed) for matching
 */
export const LEGAL_FORM_ENTRIES: readonly LegalFormEntry[] = [
  // US corporate forms (strong)
  { id: 'Inc', patterns: ['INC', 'INCORPORATED'], strong: true },
  { id: 'Corp', patterns: ['CORP', 'CORPORATION'], strong: true },
  { id: 'LLC', patterns: ['LLC', 'L L C', 'L.L.C.'], strong: true },
  { id: 'LLP', patterns: ['LLP', 'L L P', 'L.L.P.'], strong: true },
  { id: 'LP', patterns: ['LP', 'L P', 'L.P.'], strong: true },

  // UK/Commonwealth forms (strong)
  { id: 'Ltd', patterns: ['LTD', 'LIMITED'], strong: true },
  { id: 'PLC', patterns: ['PLC', 'P L C', 'P.L.C.'], strong: true },

  // European forms (strong)
  { id: 'GmbH', patterns: ['GMBH', 'G M B H'], strong: true },
  { id: 'AG', patterns: ['AG', 'A G'], strong: true },
  { id: 'SA', patterns: ['SA', 'S A', 'S.A.'], strong: true },
  { id: 'SAS', patterns: ['SAS', 'S A S'], strong: true },
  { id: 'BV', patterns: ['BV', 'B V', 'B.V.'], strong: true },
  { id: 'Oy', patterns: ['OY'], strong: true },
  { id: 'SRL', patterns: ['SRL', 'S R L'], strong: true },
  { id: 'SpA', patterns: ['SPA', 'S P A'], strong: true },

  // Institutional forms (strong)
  { id: 'Trust', patterns: ['TRUST'], strong: true },
  { id: 'Foundation', patterns: ['FOUNDATION'], strong: true },

  // Weaker signals (need context)
  { id: 'Company', patterns: ['COMPANY'], strong: false },
  { id: 'Co', patterns: ['CO'], strong: false },
];

/**
 * Build a map of normalized pattern -> LegalFormEntry for fast lookup
 */
export function buildLegalFormIndex(): Map<string, LegalFormEntry> {
  const map = new Map<string, LegalFormEntry>();
  for (const entry of LEGAL_FORM_ENTRIES) {
    for (const pattern of entry.patterns) {
      const key = normalizeForMatch(pattern);
      if (!map.has(key)) {
        map.set(key, entry);
      }
    }
  }
  return map;
}

/**
 * Normalize a string for matching (uppercase, remove periods, collapse spaces)
 */
export function normalizeForMatch(value: string): string {
  return value
    .toUpperCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const LEGAL_FORM_INDEX = buildLegalFormIndex();

/**
 * Check if a token matches a legal form suffix
 */
export function matchLegalForm(token: string): LegalFormEntry | undefined {
  const normalized = normalizeForMatch(token);
  return LEGAL_FORM_INDEX.get(normalized);
}

/**
 * Regex to match legal suffixes at the end of a string
 * Captures the suffix and optional preceding comma
 */
export const LEGAL_SUFFIX_END_RE = new RegExp(
  '(?:^|[\\s,])' +
  '(' +
  'inc\\.?|incorporated|' +
  'corp\\.?|corporation|' +
  'llc|l\\.l\\.c\\.|' +
  'llp|l\\.l\\.p\\.|' +
  'lp|l\\.p\\.|' +
  'ltd\\.?|limited|' +
  'plc|p\\.l\\.c\\.|' +
  'gmbh|' +
  'ag|' +
  's\\.?a\\.?|sas|' +
  'bv|b\\.v\\.|' +
  'oy|' +
  'srl|' +
  'spa|' +
  'trust|foundation' +
  ')' +
  '\\.?$',
  'i'
);

/**
 * Regex for comma-legal form: "Acme, Inc."
 */
export const COMMA_LEGAL_RE = /,\s*(inc\.?|llc|l\.l\.c\.|corp\.?|ltd\.?|plc|gmbh|s\.a\.)\.?$/i;

/**
 * Extract legal suffix from a string if present at the end
 */
export function extractLegalSuffix(text: string): { baseName: string; suffix: string; legalForm: LegalForm } | null {
  // Try comma-legal first
  const commaMatch = text.match(COMMA_LEGAL_RE);
  if (commaMatch) {
    const suffix = commaMatch[1];
    const baseName = text.slice(0, commaMatch.index!).trim();
    const entry = matchLegalForm(suffix);
    return {
      baseName,
      suffix: commaMatch[0].trim(),
      legalForm: entry?.id ?? 'UnknownLegalForm',
    };
  }

  // Try end suffix
  const endMatch = text.match(LEGAL_SUFFIX_END_RE);
  if (endMatch) {
    const suffix = endMatch[1];
    const fullMatch = endMatch[0];
    const baseName = text.slice(0, text.length - fullMatch.length).trim();
    const entry = matchLegalForm(suffix);
    return {
      baseName: baseName || text.replace(new RegExp(suffix + '\\.?$', 'i'), '').trim(),
      suffix,
      legalForm: entry?.id ?? 'UnknownLegalForm',
    };
  }

  return null;
}

/**
 * Check if text has a legal suffix (quick boolean check)
 */
export function hasLegalSuffix(text: string): boolean {
  return LEGAL_SUFFIX_END_RE.test(text) || COMMA_LEGAL_RE.test(text);
}
